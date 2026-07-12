import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResearchWorkspace } from "./research-workspace";

describe("ResearchWorkspace", () => {
  it("defaults to English and switches the complete interface to Chinese", async () => {
    const user = userEvent.setup();
    render(<ResearchWorkspace />);

    expect(screen.getByRole("heading", { name: "Research material" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "切换到中文" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "切换到中文" }));
    expect(screen.getByRole("heading", { name: "研究材料" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to English" })).toBeInTheDocument();
  });

  it("keeps report output language independent from UI language", async () => {
    const user = userEvent.setup();
    render(<ResearchWorkspace />);
    const outputLanguage = screen.getByRole("combobox", { name: "Report language" });
    await user.selectOptions(outputLanguage, "zh-CN");
    await user.click(screen.getByRole("button", { name: "切换到中文" }));
    expect(screen.getByRole("combobox", { name: "报告语言" })).toHaveValue("zh-CN");
  });

  it("loads sample material and updates the character count", async () => {
    const user = userEvent.setup();
    render(<ResearchWorkspace />);
    await user.click(screen.getByRole("button", { name: "Use sample" }));
    expect(screen.getByRole("textbox", { name: "Research material" })).not.toHaveValue("");
    expect(screen.getByText(/characters$/)).toBeInTheDocument();
  });

  it("does not fetch when the material is blank", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<ResearchWorkspace />);
    await user.click(screen.getByRole("button", { name: "Generate report" }));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Add research material before generating");
    fetchSpy.mockRestore();
  });

  it("restores the previous report when regeneration fails before content", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("# Previous report", { status: 200 }))
      .mockResolvedValueOnce(
        Response.json({ code: "UPSTREAM_UNAVAILABLE", message: "Service unavailable" }, { status: 503 }),
      );
    const user = userEvent.setup();
    render(<ResearchWorkspace />);
    await user.click(screen.getByRole("button", { name: "Use sample" }));
    await user.click(screen.getByRole("button", { name: "Generate report" }));
    expect(await screen.findByRole("heading", { name: "Previous report" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Generate report" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Service unavailable"));
    expect(screen.getByRole("heading", { name: "Previous report" })).toBeInTheDocument();
    fetchSpy.mockRestore();
  });
});
