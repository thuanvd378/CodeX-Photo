import { ClipboardList } from "lucide-react";
import { Badge } from "../ui/badge";
import { useEditorStore } from "../../app/editor-store";

export function EditPlanPanel() {
  const editPlan = useEditorStore((state) => state.editPlan);

  return (
    <section className="border-b border-[rgb(var(--border))] p-4">
      <div className="mb-3 flex items-center gap-2">
        <ClipboardList size={17} className="text-[rgb(var(--accent))]" />
        <h2 className="text-sm font-semibold text-[rgb(var(--text))]">Kế hoạch AI</h2>
      </div>
      {!editPlan ? (
        <div className="rounded-md border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--panel-subtle))] px-3 py-4 text-sm leading-6 text-[rgb(var(--muted))]">
          Kế hoạch chỉnh sửa sẽ xuất hiện sau khi tạo ảnh.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge>{editPlan.intent}</Badge>
            <Badge>{editPlan.export_preset}</Badge>
          </div>
          <p className="text-sm leading-6 text-[rgb(var(--muted))]">{editPlan.explanation_vi}</p>
          <ol className="space-y-2">
            {editPlan.steps.map((step, index) => (
              <li
                key={`${step.tool}-${index}`}
                className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-subtle))] px-3 py-2"
              >
                <div className="text-xs font-semibold text-[rgb(var(--text))]">
                  {index + 1}. {step.tool}
                </div>
                <div className="mt-1 truncate text-xs text-[rgb(var(--muted))]">
                  {Object.keys(step.parameters).length > 0 ? JSON.stringify(step.parameters) : "default"}
                </div>
              </li>
            ))}
          </ol>
          {editPlan.risk_warnings.length > 0 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              {editPlan.risk_warnings.join(" ")}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
