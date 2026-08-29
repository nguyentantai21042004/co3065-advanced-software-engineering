'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  FileText,
  Target,
  FileDown,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('coaching');

  useEffect(() => {
    const user = getUser();
    setEmail(user?.email ?? null);
    setIsAuthReady(true);
  }, []);

  const handlePrimaryCta = () => {
    if (email) {
      router.push('/dashboard/upload');
    } else {
      router.push('/auth/register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 h-15 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-slate-900 text-white shadow-soft-xs">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900">AI Coach</span>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">Career Studio</p>
            </div>
          </div>

          {/* Header Action Buttons with transitions.dev check logic */}
          <nav className="flex items-center gap-2 min-h-[36px]">
            {!isAuthReady ? (
              // Stable placeholder while verifying authentication state to prevent layout shift / flash
              <div className="flex items-center gap-2 opacity-0 pointer-events-none">
                <div className="h-8 w-20 rounded-lg bg-slate-100" />
                <div className="h-8 w-28 rounded-lg bg-slate-200" />
              </div>
            ) : email ? (
              <div className="t-reveal flex items-center gap-2.5">
                <span className="text-xs text-slate-500 hidden sm:inline-block max-w-[150px] truncate">
                  {email}
                </span>
                <Link href="/dashboard/upload">
                  <Button size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                    Bảng điều khiển
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="t-reveal flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                    Bắt đầu ngay
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 bg-white border-b border-slate-200/80 bg-hero-grid">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-6 shadow-soft-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Hệ thống phân tích hồ sơ CV &amp; Định hướng chuyên nghiệp</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight max-w-3xl mx-auto">
            Phản biện cấu trúc CV rõ ràng, chuẩn hóa và nâng tầm năng lực phỏng vấn
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Tải lên tài liệu PDF hoặc Word của bạn. Hệ thống tự động bóc tách dữ liệu, đối chiếu tiêu chuẩn vai trò thực tế và cung cấp kế hoạch hành động từng bước.
          </p>

          {/* Hero CTAs with transitions.dev logic */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handlePrimaryCta}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="shadow-soft"
            >
              <span className="t-text-swap">
                {!isAuthReady
                  ? 'Bắt đầu phân tích CV'
                  : email
                  ? 'Tải lên CV của bạn'
                  : 'Bắt đầu đánh giá miễn phí'}
              </span>
            </Button>

            {!isAuthReady ? (
              <div className="h-10.5 w-36 rounded-lg bg-slate-100 opacity-0" />
            ) : !email ? (
              <Link href="/auth/login" className="t-reveal">
                <Button variant="secondary" size="lg">
                  Đăng nhập tài khoản
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard/history" className="t-reveal">
                <Button variant="secondary" size="lg">
                  Xem lịch sử CV
                </Button>
              </Link>
            )}
          </div>

          {/* Interactive Live Preview Mockup Card */}
          <div className="mt-12 max-w-3xl mx-auto text-left">
            <Card className="overflow-hidden shadow-soft-md border-slate-200/90 bg-white">
              {/* Mockup Header with Sliding Tabs */}
              <div className="border-b border-slate-200/80 bg-slate-50 px-4 sm:px-5 py-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-700">
                    Hồ sơ mẫu: Senior_FullStack_Engineer.pdf
                  </span>
                </div>

                <Tabs
                  tabs={[
                    { id: 'coaching', label: 'Báo cáo phản biện' },
                    { id: 'profile', label: 'Dữ liệu bóc tách' },
                  ]}
                  activeTab={activePreviewTab}
                  onChange={setActivePreviewTab}
                />
              </div>

              <div className="p-6">
                {activePreviewTab === 'coaching' ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            Vai trò mục tiêu: Kỹ sư Full-Stack &amp; Kiến trúc đám mây
                          </h3>
                          <Badge variant="success" size="sm">Độ phù hợp cao</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          5+ năm kinh nghiệm phát triển backend hiệu năng cao và giải pháp frontend hiện đại.
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="brand" size="sm">Senior Backend</Badge>
                        <Badge variant="brand" size="sm">Full-Stack Lead</Badge>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3.5">
                      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-4">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Điểm mạnh nổi bật</span>
                        </div>
                        <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
                          <li>Số liệu thành tựu định lượng rõ ràng (&ldquo;giảm độ trễ 42%&rdquo;).</li>
                          <li>Kinh nghiệm sâu với PostgreSQL, Docker và Message Queue.</li>
                          <li>Lộ trình phát triển năng lực thăng tiến liên tục.</li>
                        </ul>
                      </div>

                      <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-4">
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-2">
                          <Target className="h-4 w-4 text-amber-600" />
                          <span>Khuyến nghị hoàn thiện</span>
                        </div>
                        <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
                          <li>Bổ sung số liệu chi tiết về chi phí hạ tầng đã tối ưu.</li>
                          <li>Làm rõ kinh nghiệm điều phối quy trình tự động hóa CI/CD.</li>
                          <li>Mở đầu bằng tóm tắt năng lực điều hành súc tích 2 câu.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 animate-fade-in">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Ứng viên</span>
                        <p className="font-semibold text-slate-900 mt-0.5">Alex Rivera</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
                        <p className="font-semibold text-slate-900 mt-0.5 truncate">alex.r@example.com</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Học vấn</span>
                        <p className="font-semibold text-slate-900 mt-0.5">Cử nhân KHMT</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Kinh nghiệm</span>
                        <p className="font-semibold text-slate-900 mt-0.5">7+ Năm</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Kỹ năng định danh</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Docker', 'Go', 'AWS', 'Distributed Systems'].map((skill) => (
                          <span key={skill} className="rounded-md bg-white border border-slate-200/80 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-soft-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Platform Highlights */}
      <section className="py-16 bg-slate-50/70 border-b border-slate-200/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Năng lực hệ thống</h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Công cụ toàn diện cho hồ sơ sự nghiệp
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Tối ưu cấu trúc, phản biện điểm thiếu hụt và xuất tệp hồ sơ hoàn chỉnh.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 flex flex-col justify-between hover:shadow-soft hover:border-slate-300 transition-all">
              <div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Bảo mật &amp; Riêng tư</h4>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Tài liệu xử lý hoàn toàn trong môi trường riêng tư của bạn, không chia sẻ với bất kỳ bên thứ ba nào.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-600">
                Mã hóa bảo mật
              </div>
            </Card>

            <Card className="p-6 flex flex-col justify-between hover:shadow-soft hover:border-slate-300 transition-all">
              <div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Bóc tách đa định dạng</h4>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Hỗ trợ mượt mà tệp PDF, DOCX và DOC, tự động bóc tách thông tin liên hệ, niên biểu và kỹ năng.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                PDF &amp; Word
              </div>
            </Card>

            <Card className="p-6 flex flex-col justify-between hover:shadow-soft hover:border-slate-300 transition-all">
              <div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Target className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">So khớp vai trò &amp; Lĩnh vực</h4>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Đối chiếu lịch sử kinh nghiệm với các chức danh thực tế trên thị trường tuyển dụng.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                Chuẩn hóa chức danh
              </div>
            </Card>

            <Card className="p-6 flex flex-col justify-between hover:shadow-soft hover:border-slate-300 transition-all">
              <div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <FileDown className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Xuất báo cáo 1-Click</h4>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Tải về báo cáo hoàn chỉnh định dạng PDF hoặc Word để chuẩn bị kỹ lưỡng trước buổi phỏng vấn.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                PDF / Word Export
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4-Step Process */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Quy trình</h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Quy trình 4 bước đơn giản
            </h3>
          </div>

          <div className="grid sm:grid-cols-4 gap-3.5">
            {[
              {
                step: '01',
                title: 'Tải lên tài liệu',
                desc: 'Hỗ trợ tệp PDF, DOCX, DOC dung lượng tối đa 10MB.',
                icon: FileText,
              },
              {
                step: '02',
                title: 'Bóc tách cấu trúc',
                desc: 'Tự động trích xuất các phần, niên biểu và từ khóa kỹ năng.',
                icon: Layers,
              },
              {
                step: '03',
                title: 'Phân tích & Phản biện',
                desc: 'Đánh giá bố cục, tính định lượng và khoảng cách năng lực.',
                icon: Target,
              },
              {
                step: '04',
                title: 'Xuất hồ sơ báo cáo',
                desc: 'Xem lại hồ sơ chuẩn hóa và xuất file PDF/Word nhanh chóng.',
                icon: FileDown,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="p-4 bg-slate-50/60 border-slate-200/70">
                  <div className="text-[10px] font-mono font-bold text-slate-400 mb-2">
                    BƯỚC {item.step}
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="h-4 w-4 text-blue-600 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="bg-slate-50/70 py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Sẵn sàng kiểm tra và tối ưu hóa hồ sơ của bạn?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Tải lên tài liệu và nhận phản hồi cấu trúc ngay trong hôm nay.
          </p>
          <div className="mt-6 flex justify-center">
            <Button size="lg" onClick={handlePrimaryCta} rightIcon={<ArrowRight className="h-4 w-4" />}>
              <span className="t-text-swap">
                {!isAuthReady
                  ? 'Bắt đầu phân tích'
                  : email
                  ? 'Đi tới bảng điều khiển'
                  : 'Đăng ký trải nghiệm miễn phí'}
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Compass className="h-4 w-4 text-blue-600" />
            <span>AI Coach Career Studio</span>
          </div>
          <p className="text-slate-400">Hệ thống phân tích hồ sơ ứng viên chuyên nghiệp</p>
        </div>
      </footer>
    </div>
  );
}
