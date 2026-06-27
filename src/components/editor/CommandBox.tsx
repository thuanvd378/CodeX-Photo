import { SendHorizontal, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useEditorStore } from "../../app/editor-store";

const SAMPLE_PROMPT = "Đổi nền thành trắng sạch như ảnh Shopee, làm sản phẩm sáng hơn, giữ nguyên logo và hình dáng.";

export function CommandBox() {
  const prompt = useEditorStore((state) => state.prompt);
  const setPrompt = useEditorStore((state) => state.setPrompt);
  const generate = useEditorStore((state) => state.generate);
  const isGenerating = useEditorStore((state) => state.isGenerating);
  const hasImage = Boolean(useEditorStore((state) => state.imageDocument));

  return (
    <section className="border-b border-[rgb(var(--border))] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[rgb(var(--text))]">Yêu cầu chỉnh sửa</h2>
        <Button variant="ghost" size="sm" icon={<Sparkles size={15} />} onClick={() => setPrompt(SAMPLE_PROMPT)}>
          Mẫu Shopee
        </Button>
      </div>
      <Textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Ví dụ: Đổi nền thành trắng sạch, làm ảnh sáng hơn, giữ nguyên logo..."
      />
      <Button
        className="mt-3 w-full"
        variant="primary"
        icon={<SendHorizontal size={17} />}
        disabled={!hasImage || isGenerating}
        onClick={() => void generate()}
      >
        {isGenerating ? "Đang tạo ảnh" : "Tạo ảnh"}
      </Button>
    </section>
  );
}
