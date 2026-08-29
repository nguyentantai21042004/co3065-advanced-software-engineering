'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import type { CvDataWire, CoachingReportWire } from '@aicoach/shared/contracts/cv';
import { api, API_URL } from '@/lib/api';
import { getToken, getCurrentFile } from '@/lib/auth';
import {
  FileText,
  FileDown,
  Compass,
  Target,
  ListOrdered,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  User,
  ArrowLeft,
  ArrowRight,
  Code2,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

function asRecord(val: unknown): Record<string, unknown> {
  return typeof val === 'object' && val !== null ? (val as Record<string, unknown>) : {};
}

function asList(val: unknown): Record<string, unknown>[] {
  if (Array.isArray(val)) {
    return val.filter((item) => typeof item === 'object' && item !== null) as Record<
      string,
      unknown
    >[];
  }
  return [];
}

function ResultsInner() {
  const params = useSearchParams();
  const fileId = params.get('file_id') ?? getCurrentFile()?.fileId;
  const [data, setData] = useState<CvDataWire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'coaching' | 'profile' | 'raw'>('coaching');
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);
  const [exportError, setExportError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!fileId) {
      setError('Không tìm thấy mã hồ sơ. Vui lòng tải lên tài liệu mới.');
      setLoading(false);
      return;
    }

    setLoading(true);
    api<CvDataWire>(`/cv/data/${fileId}`)
      .then((res) => {
        if (!res.data) throw new Error('Không nhận được dữ liệu hồ sơ từ máy chủ.');
        setData(res.data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể tải kết quả phân tích.');
      })
      .finally(() => setLoading(false));
  }, [fileId]);

  async function onExport(format: 'pdf' | 'docx') {
    if (!fileId) return;
    setExporting(format);
    setExportError('');

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/cv/export/${fileId}/${format}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`Xuất tệp thất bại (Mã phản hồi: ${res.status})`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coaching-report-${fileId.slice(0, 8)}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Không thể tải tệp xuất ra.');
    } finally {
      setExporting(null);
    }
  }

  function handleCopyText() {
    if (!data?.raw_text) return;
    navigator.clipboard.writeText(data.raw_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Đang tổng hợp hồ sơ phản biện…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center border-red-200 bg-white shadow-soft-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy báo cáo</h2>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{error || 'Hồ sơ chưa có dữ liệu kết quả.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard/upload">
            <Button size="sm">Tải lên hồ sơ mới</Button>
          </Link>
          <Link href="/dashboard/history">
            <Button variant="outline" size="sm">Xem lịch sử</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const info = asRecord(data.basic_info);
  const education = asList(data.education);
  const experience = asList(data.work_experience);
  const skills = asList(data.skills);
  const certsBlock = asRecord(data.certificates_languages);
  const certs = asList(certsBlock.certificates);
  const langs = asList(certsBlock.languages);
  const report = data.coaching_report;

  const candidateName = String(info.name || getCurrentFile()?.name || 'Ứng viên');
  const targetDomain = report?.domain_inference?.domain ?? 'Kỹ sư Phần mềm & Công nghệ';

  const initials = candidateName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CV';

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/history"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại lịch sử hồ sơ</span>
        </Link>
        <Badge variant="success" size="sm" dot>
          Đã phân tích xong
        </Badge>
      </div>

      {/* Executive Candidate Header Card */}
      <Card className="p-6 sm:p-7 bg-white shadow-soft-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-lg shrink-0 shadow-soft-xs">
              {initials}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="brand" size="sm">
                  {targetDomain}
                </Badge>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs font-mono text-slate-400">Mã: {data.file_id.slice(0, 8)}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {candidateName}
              </h1>
              <p className="text-xs text-slate-500">
                Hồ sơ đã được chuẩn hóa và tổng hợp khuyến nghị định hướng nghề nghiệp.
              </p>
            </div>
          </div>

          {/* Quick Export Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              leftIcon={<FileDown className="h-4 w-4" />}
              loading={exporting === 'pdf'}
              disabled={exporting !== null || !report}
              onClick={() => void onExport('pdf')}
            >
              Xuất file PDF
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<FileText className="h-4 w-4 text-slate-600" />}
              loading={exporting === 'docx'}
              disabled={exporting !== null || !report}
              onClick={() => void onExport('docx')}
            >
              Xuất tệp Word (.docx)
            </Button>
          </div>
        </div>

        {exportError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}
      </Card>

      {/* Segmented Navigation Tabs */}
      <div className="flex justify-start">
        <Tabs
          tabs={[
            { id: 'coaching', label: 'Báo cáo phản biện & Đề xuất', icon: <Target className="h-3.5 w-3.5" /> },
            { id: 'profile', label: 'Hồ sơ bóc tách chi tiết', icon: <User className="h-3.5 w-3.5" /> },
            { id: 'raw', label: 'Văn bản tài liệu gốc', icon: <Code2 className="h-3.5 w-3.5" /> },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as 'coaching' | 'profile' | 'raw')}
        />
      </div>

      {/* Tab 1: Coaching Report */}
      {activeTab === 'coaching' && (
        <div className="space-y-5 animate-fade-in">
          {report ? (
            <>
              {/* Domain & Roles Inference Card */}
              <Card className="p-6 shadow-soft-xs bg-white">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Lĩnh vực &amp; Vị trí ứng tuyển mục tiêu
                    </h3>
                    <p className="text-xs text-slate-500">Phân loại tự động dựa trên toàn bộ niên biểu kinh nghiệm</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                  <p className="text-sm font-semibold text-blue-900">{report.domain_inference.domain}</p>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    {report.domain_inference.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {report.domain_inference.job_titles.map((title) => (
                      <Badge key={title} variant="brand" size="sm">
                        {title}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Strengths & Gaps Bento Grid */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Strengths */}
                <Card className="p-6 border-emerald-200/80 bg-white shadow-soft-xs">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-950">
                        Điểm mạnh nổi bật
                      </h3>
                      <p className="text-xs text-slate-500">Các năng lực có tính cạnh tranh cao</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {report.experience_comments.summary}
                  </p>

                  <ul className="space-y-2.5">
                    {report.experience_comments.strengths.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 rounded-lg border border-emerald-100 bg-emerald-50/30 p-3 text-xs text-slate-800"
                      >
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Gaps / Growth Areas */}
                <Card className="p-6 border-amber-200/80 bg-white shadow-soft-xs">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <AlertCircle className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-950">
                        Điểm cần hoàn thiện
                      </h3>
                      <p className="text-xs text-slate-500">Các tín hiệu thiếu hụt hoặc chưa định lượng</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Những khía cạnh cần củng cố để phù hợp hơn với các vai trò cấp cao:
                  </p>

                  <ul className="space-y-2.5">
                    {report.experience_comments.gaps.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 rounded-lg border border-amber-100 bg-amber-50/30 p-3 text-xs text-slate-800"
                      >
                        <ChevronRight className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Format Critique */}
              <Card className="p-6 shadow-soft-xs bg-white">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Đánh giá cấu trúc &amp; Bố cục trình bày
                    </h3>
                    <p className="text-xs text-slate-500">Khả năng quét của hệ thống ATS và nhịp điệu thị giác</p>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  {report.format_critique.summary}
                </p>

                <div className="grid sm:grid-cols-2 gap-2.5">
                  {report.format_critique.findings.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200/80 bg-slate-50 p-3 text-xs text-slate-700 flex items-start gap-2"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actionable Recommendations */}
              <Card className="p-6 border-slate-200 bg-white shadow-soft-xs">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Kế hoạch hành động cải thiện hồ sơ
                    </h3>
                    <p className="text-xs text-slate-500">Các bước hành động cụ thể giúp nâng cao sức thuyết phục</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {report.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-lg border border-slate-200/80 bg-white p-3.5 shadow-soft-xs"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed pt-0.5">{rec}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center border-amber-200 bg-amber-50/40">
              <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-amber-900">Đang tổng hợp báo cáo phản biện</h3>
              <p className="text-xs text-amber-800 mt-1">
                Báo cáo đang trong hàng đợi xử lý. Vui lòng tải lại sau ít giây.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Extracted Profile */}
      {activeTab === 'profile' && (
        <div className="space-y-5 animate-fade-in">
          {/* Basic Info */}
          <Card className="p-6 shadow-soft-xs bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Thông tin liên hệ &amp; Cá nhân
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                { label: 'Họ và tên', value: info.name, icon: User },
                { label: 'Địa chỉ email', value: info.email, icon: Mail },
                { label: 'Số điện thoại', value: info.phone, icon: Phone },
                { label: 'Địa điểm / Khu vực', value: info.address, icon: MapPin },
                { label: 'Ngày sinh', value: info.date_of_birth, icon: Calendar },
                { label: 'Giới tính', value: info.gender, icon: User },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400">
                      <Icon className="h-3 w-3" />
                      <span>{item.label}</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-800 truncate">
                      {String(item.value ?? '—')}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Work Experience Timeline */}
          <Card className="p-6 shadow-soft-xs bg-white">
            <div className="flex items-center gap-2 mb-5">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Lịch sử kinh nghiệm làm việc ({experience.length})
              </h3>
            </div>

            {experience.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Không tìm thấy dữ liệu kinh nghiệm làm việc.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {experience.map((row, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-1">
                    <div className="h-5.5 w-5.5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 z-10 text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 rounded-xl border border-slate-200/80 bg-white p-4 shadow-soft-xs">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {String(row.position ?? row.role ?? 'Vị trí đảm nhiệm')}
                        </h4>
                        <span className="text-xs font-semibold text-blue-600 font-mono">
                          {String(row.time ?? row.duration ?? 'Thời gian chưa xác định')}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 mt-0.5">
                        {String(row.company_name ?? row.company ?? 'Doanh nghiệp / Tổ chức')}
                      </p>
                      {Boolean(row.description) && (
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed whitespace-pre-line">
                          {String(row.description)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Education */}
          <Card className="p-6 shadow-soft-xs bg-white">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Học vấn &amp; Bằng cấp ({education.length})
              </h3>
            </div>

            {education.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa phát hiện thông tin học vấn.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {education.map((row, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50">
                    <h4 className="text-xs font-bold text-slate-900">
                      {String(row.school_name ?? row.school ?? 'Cơ sở giáo dục')}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {String(row.degree ?? '')} {row.major ? `chuyên ngành ${String(row.major)}` : ''}
                    </p>
                    {Boolean(row.year) && <p className="text-[11px] text-slate-400 mt-1">Năm tốt nghiệp: {String(row.year)}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Skills Breakdown */}
          <Card className="p-6 shadow-soft-xs bg-white">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Kỹ năng chuyên môn trích xuất ({skills.length})
              </h3>
            </div>

            {skills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Không có kỹ năng được ghi nhận.</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {skills.map((row, idx) => {
                  const skillName = String(row.name ?? Object.keys(row)[0] ?? 'Kỹ năng');
                  const level = typeof row.level === 'number' ? row.level : null;
                  return (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200/80 bg-white shadow-soft-xs">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800">{skillName}</span>
                        {level !== null && <span className="font-bold text-blue-600">{level}%</span>}
                      </div>
                      {level !== null && (
                        <div className="mt-2">
                          <Progress value={level} size="sm" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Certifications & Languages */}
          <div className="grid md:grid-cols-2 gap-5">
            <Card className="p-6 shadow-soft-xs bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Chứng chỉ nghề nghiệp ({certs.length})
                </h3>
              </div>
              {certs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Không có chứng chỉ nào.</p>
              ) : (
                <ul className="space-y-2">
                  {certs.map((c, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>{String(c.name ?? c)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-6 shadow-soft-xs bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Languages className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Ngoại ngữ ({langs.length})
                </h3>
              </div>
              {langs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Không có ngoại ngữ nào.</p>
              ) : (
                <ul className="space-y-2">
                  {langs.map((l, i) => (
                    <li key={i} className="text-xs text-slate-700 flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="font-medium">{String(l.name ?? l)}</span>
                      {Boolean(l.proficiency) && <Badge variant="neutral" size="sm">{String(l.proficiency)}</Badge>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Raw Extracted Document */}
      {activeTab === 'raw' && (
        <Card className="p-6 shadow-soft-xs bg-white animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Văn bản tài liệu thô trích xuất
              </h3>
              <p className="text-xs text-slate-500">
                Chuỗi văn bản bóc tách trực tiếp từ tệp tải lên
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyText}
            >
              <span className="t-icon-swap mr-1.5" data-state={copied ? 'b' : 'a'}>
                <span className="t-icon" data-icon="a">
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                </span>
                <span className="t-icon" data-icon="b">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </span>
              </span>
              <span className="t-text-swap">
                {copied ? 'Đã sao chép' : 'Sao chép toàn bộ'}
              </span>
            </Button>
          </div>

          <div className="relative mt-4">
            <pre className="max-h-[500px] overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-200 leading-relaxed selection:bg-blue-600 selection:text-white">
              {data.raw_text || '(Không có nội dung văn bản)'}
            </pre>
          </div>
        </Card>
      )}

      {/* Bottom Sticky Action Footer */}
      <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
        <Link href="/dashboard/upload">
          <Button variant="outline" size="sm">
            Tải lên hồ sơ khác
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href="/dashboard/history">
            <Button variant="secondary" size="sm">
              Xem toàn bộ danh sách
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      }
    >
      <ResultsInner />
    </Suspense>
  );
}
