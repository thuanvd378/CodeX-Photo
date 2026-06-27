import { executeEditPlan } from "../agent/execute-edit-plan";
import { createLocalEditPlan } from "../agent/prompt-planner";
import type { PlanEditRequest } from "../types/api";
import type { ImageDocument } from "./image-document";

export async function runLocalMockEdit(document: ImageDocument, request: PlanEditRequest) {
  const plan = createLocalEditPlan(request);
  const result = await executeEditPlan(document, plan, { mode: "demo" });
  return {
    plan,
    document: result.document,
    messages: result.messages
  };
}
