'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Terminal,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const [health, setHealth] = useState<'checking' | 'healthy' | 'unreachable'>('checking');

  function checkHealth() {
    setHealth('checking');
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.ok) setHealth('healthy');
        else setHealth('unreachable');
      })
      .catch(() => setHealth('unreachable'));
  }

  useEffect(() => {
    checkHealth();
  }, []);

  function handleCopyApi() {
    navigator.clipboard.writeText(API_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Cấu hình &amp; Trạng thái hệ thống
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Thông tin kiểm tra kết nối dịch vụ và hạ tầng phân tích hồ sơ.
        </p>
      </div>

      {/* Health Status Banner */}
      <Card className="p-5 shadow-soft-xs bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              health === 'healthy'
                ? 'bg-emerald-50 text-emerald-600'
                : health === 'checking'
                ? 'bg-slate-100 text-slate-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {health === 'healthy' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : health === 'checking' ? (
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Trạng thái kết nối API</h3>
              <Badge
                variant={health === 'healthy' ? 'success' : health === 'checking' ? 'neutral' : 'danger'}
                size="sm"
                dot
              >
                {health === 'healthy' ? 'Hoạt động bình thường' : health === 'checking' ? 'Đang kiểm tra…' : 'Mất kết nối'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{API_URL}/health</p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={checkHealth}>
          Kiểm tra lại
        </Button>
      </Card>

      {/* API Configuration Card */}
      <Card className="p-6 shadow-soft-xs bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Cổng kết nối API Gateway
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Địa chỉ dịch vụ nội bộ
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={API_URL}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs text-slate-900 select-all focus:outline-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyApi}
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
                  {copied ? 'Đã chép' : 'Sao chép'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Infrastructure Components Grid */}
      <Card className="p-6 shadow-soft-xs bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Thành phần hạ tầng xử lý
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <Database className="h-4 w-4 text-blue-600" />
              <span>Cơ sở dữ liệu &amp; Lưu trữ hồ sơ</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lưu trữ quan hệ đảm bảo an toàn cho dữ liệu ứng viên, lịch sử đánh giá và siêu dữ liệu bóc tách.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <HardDrive className="h-4 w-4 text-blue-600" />
              <span>Kho lưu trữ tài liệu tệp</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Phân vùng lưu trữ bảo mật cho tệp CV gốc (.pdf, .docx) và các báo cáo hồ sơ xuất ra.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <Server className="h-4 w-4 text-blue-600" />
              <span>Bộ trích xuất cấu trúc văn bản</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Xử lý chuyển đổi văn bản và bóc tách cấu trúc thời gian, công ty, học vấn và kỹ năng.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <Cpu className="h-4 w-4 text-blue-600" />
              <span>Công cụ phân tích &amp; Đánh giá</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Phân tích độ phù hợp với vai trò mục tiêu, kiểm tra định dạng và tổng hợp kế hoạch hành động.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
