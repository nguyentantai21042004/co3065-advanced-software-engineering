import { randomUUID } from 'node:crypto';
import type { Analyzer } from '../../platform/llm.js';
import type { TextExtractor } from '../../platform/extract.js';
import type { FileStorage } from '../../platform/storage.js';
import type { JobQueue } from '../../platform/queue.js';
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
}

/** Pull file → extract text → store extraction_result → analyze → store cv_analysis_result. */
export function registerCvWorker(deps: CvWorkerDeps): void {
  deps.queue.register<ExtractJob>(EXTRACT_JOB, async (payload) => {
    const file = await deps.repo.getFile(payload.fileId);
    if (!file) {
      console.warn('extract job: file missing', payload.fileId);
      return;
    }

    const bytes = await deps.storage.get(file.storage_path);
    const rawText = await deps.extractor.extract(bytes, file.content_type, file.original_file_name);

    const extraction = await deps.repo.insertExtraction({
      id: randomUUID(),
      file_id: file.file_id,
      raw_text: rawText,
      avatar_id: null,
    });

    const analysis = await deps.analyzer.analyze(rawText || '');
    const analysisResult = {
      ...analysis.analysis_result,
      coaching_report: analysis.coaching_report,
    };
    await deps.repo.insertAnalysis({
      id: randomUUID(),
      extraction_result_id: extraction.id,
      file_id: file.file_id,
      basic_info: analysis.basic_info,
      education: analysis.education,
      work_experience: analysis.work_experience,
      skills: analysis.skills,
      certificates_languages: analysis.certificates_languages,
      analysis_result: analysisResult,
    });
  });
}
