import { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAsyncData } from '../../hooks/useAsyncData';
import { adminApi } from '../../lib/adminApi';

export default function RatingsPage() {
  const [replies, setReplies] = useState({});

  const { data, loading, reload } = useAsyncData(async () => {
    const res = await adminApi.getRatings();
    return res.data || [];
  }, []);

  async function handleReply(id) {
    const text = (replies[id] || '').trim();
    if (!text) return;
    await adminApi.replyRating(id, text);
    setReplies((prev) => ({ ...prev, [id]: '' }));
    reload();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Quản lý Đánh giá & Phản hồi</h1>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Đang tải...</div>
      ) : (
        <div className="space-y-4">
          {(data || []).map((rev) => (
            <div key={rev._id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">
                  {rev.userId?.fullName || 'Khách hàng'} • <span className="text-amber-600">{rev.overallScore}★</span>
                </div>
                <Button
                  variant="danger"
                  className="px-2.5 py-1 text-xs"
                  onClick={async () => {
                    await adminApi.deleteOrHideRating(rev._id);
                    reload();
                  }}
                >
                  <Trash2 size={14} /> Ẩn
                </Button>
              </div>
              <p className="text-sm text-slate-700">{rev.comment}</p>
              {rev.hostReply?.content ? (
                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  <b>Phản hồi:</b> {rev.hostReply.content}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    placeholder="Phản hồi đánh giá..."
                    value={replies[rev._id] || ''}
                    onChange={(e) => setReplies((prev) => ({ ...prev, [rev._id]: e.target.value }))}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  />
                  <Button className="px-3 py-1.5 text-xs" onClick={() => handleReply(rev._id)}>
                    <Send size={14} /> Gửi
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}