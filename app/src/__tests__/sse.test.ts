import { describe, it, expect } from "vitest";
import { parseSSE } from "../lib/sse";

describe("parseSSE", () => {
  it("parses a correct single data chunk", () => {
    const chunk = `data: {"delta":"hello"}\n`;
    expect(parseSSE(chunk)).toEqual(["hello"]);
  });

  it("ignores broken JSON and keep-alive lines", () => {
    const chunk = `: keep-alive\ndata: not-json{{{\ndata: {"delta":"ok"}\n`;
    expect(parseSSE(chunk)).toEqual(["ok"]);
  });

  it("parses multiple data lines in one chunk", () => {
    const chunk = `data: {"delta":"a"}\ndata: {"delta":"b"}\ndata: {"delta":"c"}\n`;
    expect(parseSSE(chunk)).toEqual(["a", "b", "c"]);
  });
});
