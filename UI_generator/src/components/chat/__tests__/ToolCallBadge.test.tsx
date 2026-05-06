import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolCallLabel } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// ─── getToolCallLabel — pure function ───────────────────────────────────────

test("getToolCallLabel: str_replace_editor create", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "create", path: "/App.jsx" })
  ).toBe("Creating App.jsx");
});

test("getToolCallLabel: str_replace_editor str_replace", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "str_replace", path: "/App.jsx" })
  ).toBe("Editing App.jsx");
});

test("getToolCallLabel: str_replace_editor insert", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "insert", path: "/App.jsx" })
  ).toBe("Editing App.jsx");
});

test("getToolCallLabel: str_replace_editor view", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "view", path: "/App.jsx" })
  ).toBe("Reading App.jsx");
});

test("getToolCallLabel: str_replace_editor undo_edit", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })
  ).toBe("Undoing edit to App.jsx");
});

test("getToolCallLabel: file_manager rename", () => {
  expect(
    getToolCallLabel("file_manager", { command: "rename", path: "/Card.jsx", new_path: "/FancyCard.jsx" })
  ).toBe("Renaming Card.jsx");
});

test("getToolCallLabel: file_manager delete", () => {
  expect(
    getToolCallLabel("file_manager", { command: "delete", path: "/Card.jsx" })
  ).toBe("Deleting Card.jsx");
});

test("getToolCallLabel: extracts basename from nested path", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "create", path: "/components/ui/Button.jsx" })
  ).toBe("Creating Button.jsx");
});

test("getToolCallLabel: missing path returns generic label", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create" })).toBe("Creating file");
});

test("getToolCallLabel: file_manager missing path returns generic label", () => {
  expect(getToolCallLabel("file_manager", { command: "delete" })).toBe("Deleting file");
});

test("getToolCallLabel: undefined args returns toolName", () => {
  expect(getToolCallLabel("str_replace_editor", undefined)).toBe("str_replace_editor");
});

test("getToolCallLabel: unknown toolName returns toolName as-is", () => {
  expect(
    getToolCallLabel("some_other_tool", { command: "create", path: "/App.jsx" })
  ).toBe("some_other_tool");
});

test("getToolCallLabel: unknown command returns toolName as-is", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "unknown_cmd", path: "/App.jsx" })
  ).toBe("str_replace_editor");
});

test("getToolCallLabel: unknown file_manager command returns toolName as-is", () => {
  expect(
    getToolCallLabel("file_manager", { command: "copy", path: "/App.jsx" })
  ).toBe("file_manager");
});

// ─── ToolCallBadge component ────────────────────────────────────────────────

test("ToolCallBadge: pending state shows spinner and label", () => {
  const toolInvocation = {
    state: "call",
    toolCallId: "abc",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
  } as ToolInvocation;

  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge: complete state shows green dot and label", () => {
  const toolInvocation = {
    state: "result",
    toolCallId: "abc",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    result: "File created: /App.jsx",
  } as ToolInvocation;

  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallBadge: partial-call state shows spinner", () => {
  const toolInvocation = {
    state: "partial-call",
    toolCallId: "abc",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/App.jsx" },
  } as ToolInvocation;

  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Editing App.jsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).not.toBeNull();
});

test("ToolCallBadge: file_manager delete label", () => {
  const toolInvocation = {
    state: "result",
    toolCallId: "xyz",
    toolName: "file_manager",
    args: { command: "delete", path: "/components/Card.jsx" },
    result: { success: true, message: "File deleted" },
  } as ToolInvocation;

  render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Deleting Card.jsx")).toBeDefined();
});

test("ToolCallBadge: file_manager rename label", () => {
  const toolInvocation = {
    state: "call",
    toolCallId: "xyz",
    toolName: "file_manager",
    args: { command: "rename", path: "/Card.jsx", new_path: "/FancyCard.jsx" },
  } as ToolInvocation;

  render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Renaming Card.jsx")).toBeDefined();
});

test("ToolCallBadge: unknown tool falls back to toolName", () => {
  const toolInvocation = {
    state: "call",
    toolCallId: "xyz",
    toolName: "some_tool",
    args: {},
  } as ToolInvocation;

  render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("some_tool")).toBeDefined();
});
