import { randomUUID } from 'node:crypto';
import type { CoachingReportWire, ExtractQuality } from '../../contracts/cv.js';
import type { Analyzer } from '../../platform/llm.js';
import type { TextExtractor } from '../../platform/extract.js';
import type { FileStorage } from '../../platform/storage.js';
import type { JobQueue } from '../../platform/queue.js';
import { cleanCvText, hasEnoughText } from '../../platform/cv-text.js';
import type { CvRepo } from './repo.js';
import { EXTRACT_JOB } from './service.js';

export interface ExtractJob {
  fileId: string;
}

export interface CvWorkerDeps {
  queue: JobQueue;
  repo: CvRepo;
  storage: FileStorage;
  extractor: TextExtractor;
  analyzer: Analyzer;
  onAnalysisComplete?: (event: {
    fileId: string;
    userId: string | null;
    analysisId: string;
    report: CoachingReportWire;
  }) => Promise<void>;
}

/** Pull file → extract text → store extraction_result → analyze → store cv_analysis_result (+ advice snapshot). */
export function registerCvWorker(deps: CvWorkerDeps): void {
  deps.queue.register<ExtractJob>(EXTRACT_JOB, async (payload) => {
    const file = await deps.repo.getFile(payload.fileId);
    if (!file) {
      console.warn('extract job: file missing', payload.fileId);
      return;
    }

    const bytes = await deps.storage.get(file.storage_path);
    const rawExtracted = await deps.extractor.extract(bytes, file.content_type, file.original_file_name);
    const rawText = cleanCvText(rawExtracted || '');
    const extractQuality: ExtractQuality = hasEnoughText(rawText) ? 'ok' : 'low';

    const extraction = await deps.repo.insertExtraction({
      id: randomUUID(),
      file_id: file.file_id,
      raw_text: rawText,
      avatar_id: null,
    });

    const analysis = await deps.analyzer.analyze(rawText || '');
    const analysisId = randomUUID();
    const analysisResult = {
      ...analysis,
      coaching_report: analysis.coaching_report,
      extract_quality: extractQuality,
    };
    await deps.repo.insertAnalysis({
      id: analysisId,
      extraction_result_id: extraction.id,
      file_id: file.file_id,
      basic_info: analysis.basic_info,
      education: analysis.education,
      work_experience: analysis.work_experience,
      skills: analysis.skills,
      certificates_languages: analysis.certificates_languages,
      analysis_result: analysisResult,
    });

    if (deps.onAnalysisComplete) {
      try {
        await deps.onAnalysisComplete({
          fileId: file.file_id,
          userId: file.user_id,
          analysisId,
          report: analysis.coaching_report,
        });
      } catch (err) {
        console.warn('advice snapshot failed', err);
      }
    }
  });
}
