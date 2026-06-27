import type { EditPlan } from "./edit-plan-schema";
import { getToolExecutor, type ToolExecutionContext } from "./tool-registry";
import { pushDocumentHistory, type ImageDocument } from "../image/image-document";

export interface ExecuteEditPlanResult {
  document: ImageDocument;
  messages: string[];
}

export async function executeEditPlan(
  document: ImageDocument,
  plan: EditPlan,
  context: ToolExecutionContext
): Promise<ExecuteEditPlanResult> {
  let working = document;
  const messages: string[] = [];

  for (const step of plan.steps) {
    const executor = getToolExecutor(step.tool);
    const result = await executor(working, step, context);
    working = result.document;
    if (result.message) {
      messages.push(result.message);
    }
  }

  const historyLabel = context.mode === "demo" ? "Demo edit result" : "AI planned edit result";
  return {
    document: pushDocumentHistory(
      {
        ...working,
        metadata: {
          ...working.metadata,
          lastPlan: plan,
          exportPreset: plan.export_preset,
          notices: [...working.metadata.notices, ...messages]
        }
      },
      historyLabel
    ),
    messages
  };
}
