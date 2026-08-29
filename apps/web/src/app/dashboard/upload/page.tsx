'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, type DragEvent } from 'react';
import type { UploadedFileWire } from '@/types/wire';
import { api } from '@/lib/api';
import { setCurrentFile } from '@/lib/auth';
import {
  Upload,
  FileText,
  AlertCircle,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { PageFrame, PageHeader, PageScroll, PageContent } from '@/components/shell/page-frame';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { notify } from '@/lib/notify';

const ALLOWED_EXT = ['.pdf', '.docx', '.doc'];
const MAX_BYTES = 10 * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  async function handleFile(file: File) {
    const lower = file.name.toLowerCase();
    if (!ALLOWED_EXT.some((ext) => lower.endsWith(ext))) {
      setStatus('error');
      notify.error('Tệp không được hỗ trợ', 'Vui lòng chọn tệp tài liệu định dạng .PDF, .DOCX hoặc .DOC.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus('error');
      notify.warning('Tệp vượt quá dung lượng', 'Kích thước tệp vượt quá mức cho phép tối đa 10MB.');
      return;
    }

    setSelectedFileName(file.name);
    setStatus('uploading');
    setProgress(20);
    setUploadStage('Đang tải tài liệu lên bộ lưu trữ an toàn…');

    try {
      const form = new FormData();
      form.append('file', file);

      setProgress(45);
      const uploaded = await api<UploadedFileWire>('/cv/upload', {
        method: 'POST',
        body: form,
      });

      const fileId = uploaded.data?.file_id;
      if (!fileId) throw new Error('Tải lên thành công nhưng không nhận được mã định danh file_id.');

      setProgress(75);
      setUploadStage('Đang bóc tách dữ liệu và tổng hợp năng lực…');
      await api(`/cv/extract/${fileId}`, { method: 'POST' });

      setProgress(100);
      setUploadStage('Hoàn tất trích xuất. Đang mở hồ sơ phản biện…');

      setCurrentFile({
        fileId,
        name: file.name,
        size: file.size,
        uploadedAt: uploaded.data?.uploaded_at ?? new Date().toISOString(),
      });

      notify.success('Xử lý tệp thành công', `Hồ sơ "${file.name}" đã sẵn sàng để phản biện.`);

      setTimeout(() => {
        router.push(`/dashboard/processing?file_id=${fileId}`);
      }, 400);
    } catch (err) {
      setStatus('error');
      notify.error('Tải lên hồ sơ thất bại', err);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  function loadSampleCV(role: 'engineer' | 'pm') {
    let sampleContent = '';
    let sampleFileName = '';

    if (role === 'engineer') {
      sampleFileName = 'Alex_Rivera_Senior_Staff_Engineer.pdf';
      sampleContent = `Alex Rivera
Email: alex.rivera@example.com | Phone: +1-555-0199 | Location: San Francisco, CA
GitHub: github.com/arivera | LinkedIn: linkedin.com/in/alexrivera-eng

SUMMARY
Senior Software Architect with 7+ years building high-concurrency cloud systems, distributed databases, and high-performance microservices. Passionate about developer tooling, reliability, and engineering mentorship.

WORK EXPERIENCE
Principal Software Engineer | CloudScale Inc. (2022 - Present)
- Architected distributed data ingestion pipeline processing 150k events/sec with sub-50ms latency using Go and Kafka.
- Reduced cloud infrastructure expenditure by 35% through container memory optimization and auto-scaling policies.
- Mentored a distributed team of 12 engineers across backend and site reliability disciplines.

Senior Full-Stack Developer | Nexus Labs (2019 - 2022)
- Built enterprise customer portal using Next.js, React, Node.js, and PostgreSQL serving 500k active monthly users.
- Designed comprehensive GraphQL API and implemented JWT-based RBAC security protocols.
- Spearheaded migration from legacy monolith to decoupled microservices with zero downtime.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley (2015 - 2019)
GPA: 3.85 / 4.0. Focus in Distributed Systems and Algorithms.

SKILLS
Programming Languages: TypeScript, Go, Python, SQL, Java
Frameworks & Tools: Node.js, Next.js, React, Docker, Kubernetes, PostgreSQL, Redis, Kafka, AWS, Git
Certifications: AWS Certified Solutions Architect Professional (2023)`;
    } else {
      sampleFileName = 'Sarah_Chen_Lead_Product_Manager.pdf';
      sampleContent = `Sarah Chen
Email: sarah.chen@example.com | Phone: +1-555-0288 | Location: Seattle, WA
Portfolio: sarahchen-pm.dev | LinkedIn: linkedin.com/in/sarahchen-lead

SUMMARY
Product Leader with 6+ years driving enterprise SaaS growth, customer-centric discovery, and AI-driven automation workflows. Proven track record of scaling ARR from $2M to $15M.

WORK EXPERIENCE
Lead Product Manager | Horizon Technologies (2021 - Present)
- Led cross-functional squad of 14 engineers, designers, and data scientists building enterprise analytics suites.
- Launched AI-assisted report synthesis feature resulting in 40% increase in daily active user retention.
- Managed end-to-end product lifecycle from user research to quarterly OKR delivery.

Product Manager | BrightPath Solutions (2018 - 2021)
- Managed core onboarding funnel, optimizing customer conversion by 28% through quantitative A/B testing.
- Conducted 80+ customer discovery interviews to synthesize product roadmap requirements.

EDUCATION
Master of Business Administration (MBA) | University of Washington (2018)
Bachelor of Arts in Economics | Northwestern University (2016)

SKILLS
Core Competencies: Product Discovery, User Research, Agile/Scrum, Roadmap Planning, Go-To-Market
Technical Proficiencies: SQL, Tableau, Figma, Jira, Mixpanel, Amplitude, Segment
Certifications: Certified Scrum Product Owner (CSPO), Pragmatic Institute Certified`;
    }

    const blob = new Blob([sampleContent], { type: 'application/pdf' });
    const sampleFile = new File([blob], sampleFileName, { type: 'application/pdf' });
    void handleFile(sampleFile);
  }

  return (
    <PageFrame>
      <PageHeader
        breadcrumbs={[
          { label: 'Bảng điều khiển', href: '/dashboard/upload' },
          { label: 'Tải lên hồ sơ' },
        ]}
        title="Tải lên hồ sơ ứng viên"
        maxWidthClass="max-w-6xl"
      />

      <PageScroll mode="scroll">
        <PageContent width="container" className="space-y-5">
          {/* Main Upload Box */}
          <Card className="p-8 shadow-soft-xs bg-white border border-slate-200">
            {status === 'uploading' ? (
              <div className="py-8 text-center space-y-4 animate-fade-in t-reveal">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Upload className="h-7 w-7 animate-bounce" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900">{selectedFileName}</h3>
                  <p className="mt-1 text-xs text-slate-500">{uploadStage}</p>
                </div>

                <div className="max-w-sm mx-auto space-y-2">
                  <Progress value={progress} size="md" />
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Tiến trình xử lý</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
                  dragActive
                    ? 'border-blue-600 bg-blue-50/40'
                    : 'border-slate-300/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />

                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-700 shadow-soft-xs border border-slate-200/80">
                  <Upload className="h-6 w-6 text-slate-700" />
                </div>

                <h3 className="text-base font-semibold text-slate-900">
                  Kéo và thả tệp CV của bạn vào đây
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Hoặc duyệt tệp từ thiết bị (.PDF, .DOCX, .DOC tối đa 10MB).
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                  <Badge variant="neutral" size="sm">.PDF</Badge>
                  <Badge variant="neutral" size="sm">.DOCX</Badge>
                  <Badge variant="neutral" size="sm">.DOC</Badge>
                  <Badge variant="neutral" size="sm">Tối đa 10 MB</Badge>
                </div>

                <div className="mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Chọn tệp từ máy tính
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Preset Sample Resumes */}
          <Card className="p-5 bg-white shadow-soft-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>Hồ sơ mẫu thử nghiệm nhanh</span>
                </div>
                <p className="text-xs text-slate-500">
                  Kiểm tra nhanh các tính năng phản biện với hồ sơ thực tế:
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FileText className="h-3.5 w-3.5 text-blue-600" />}
                  onClick={() => loadSampleCV('engineer')}
                >
                  CV Kỹ sư Phần mềm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FileText className="h-3.5 w-3.5 text-blue-600" />}
                  onClick={() => loadSampleCV('pm')}
                >
                  CV Giám đốc Sản phẩm
                </Button>
              </div>
            </div>
          </Card>

          {/* Security Note */}
          <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Tài liệu được bảo vệ an toàn trong môi trường cục bộ riêng tư của bạn, không chia sẻ với bất kỳ bên thứ ba nào.
            </span>
          </div>
        </PageContent>
      </PageScroll>
    </PageFrame>
  );
}
