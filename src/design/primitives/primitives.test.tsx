// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Badge, Button, Card, Field, Modal, Panel } from "./index";

/*
 * Smoke tests, deliberately.
 *
 * These do not check what the primitives look like. Asserting on shadow tokens
 * or padding would fail on every intentional design change, and phase 5 already
 * showed how that goes: the way a contrast regression was found was by
 * measuring against composited surfaces, not by a unit test noticing a class
 * name had moved.
 *
 * What they do check is the part that is not a matter of taste -- the
 * accessibility wiring. A label that is not associated with its input, or an
 * error that is not announced, is a defect regardless of how the page looks,
 * and it is invisible to anyone reviewing a screenshot.
 */

afterEach(cleanup);

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Run</Button>);

    expect(screen.getByRole("button", { name: "Run" })).toBeDefined();
  });

  it("forwards the disabled state to the element, not just to the styling", () => {
    // A button that only looks disabled is still clickable, and still
    // submits.
    render(<Button disabled>Run</Button>);

    expect(screen.getByRole("button")).toHaveProperty("disabled", true);
  });

  it("forwards arbitrary props such as type and aria-label", () => {
    render(
      <Button type="submit" aria-label="Run the program">
        Run
      </Button>
    );
    const button = screen.getByRole("button", { name: "Run the program" });

    expect(button.getAttribute("type")).toBe("submit");
  });

  it.each(["primary", "secondary", "ghost", "danger"] as const)(
    "renders the %s variant with distinct classes",
    (variant) => {
      const { container } = render(<Button variant={variant}>Go</Button>);

      expect(container.querySelector("button")?.className).toBeTruthy();
    }
  );

  it("gives each variant a different class list", () => {
    const { container: primary } = render(<Button variant="primary">Go</Button>);
    const { container: danger } = render(<Button variant="danger">Go</Button>);

    expect(primary.querySelector("button")?.className).not.toBe(
      danger.querySelector("button")?.className
    );
  });

  it("keeps the caller's className alongside its own", () => {
    render(<Button className="custom-class">Go</Button>);

    expect(screen.getByRole("button").className).toContain("custom-class");
  });
});

describe("Field", () => {
  it("associates the label with the input", () => {
    // getByLabelText only resolves when htmlFor and id actually match.
    render(<Field label="Project name" />);

    expect(screen.getByLabelText("Project name")).toBeDefined();
  });

  it("keeps the label available to screen readers when it is visually hidden", () => {
    render(<Field label="Search" hideLabel />);

    expect(screen.getByLabelText("Search")).toBeDefined();
  });

  it("respects an explicit id instead of generating one", () => {
    render(<Field label="Email" id="email-field" />);

    expect(screen.getByLabelText("Email").getAttribute("id")).toBe("email-field");
  });

  it("derives a usable id from an awkward label", () => {
    render(<Field label="Email / username" />);

    expect(screen.getByLabelText("Email / username").getAttribute("id")).toBeTruthy();
  });

  it("announces a hint through aria-describedby", () => {
    render(<Field label="Name" hint="Shown to your classmates." />);
    const input = screen.getByLabelText("Name");
    const describedBy = input.getAttribute("aria-describedby");

    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toBe(
      "Shown to your classmates."
    );
  });

  it("announces an error through aria-describedby and marks the field invalid", () => {
    render(<Field label="Name" error="That name is taken." />);
    const input = screen.getByLabelText("Name");

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(
      document.getElementById(input.getAttribute("aria-describedby")!)?.textContent
    ).toBe("That name is taken.");
  });

  it("shows the error instead of the hint when both are given", () => {
    // Two competing messages under one field is worse than one clear one.
    render(<Field label="Name" hint="A hint." error="An error." />);

    expect(screen.queryByText("A hint.")).toBeNull();
    expect(screen.getByText("An error.")).toBeDefined();
  });

  it("is not marked invalid when there is no error", () => {
    render(<Field label="Name" />);

    expect(screen.getByLabelText("Name").getAttribute("aria-invalid")).toBeNull();
  });

  it("forwards input props such as placeholder and type", () => {
    render(<Field label="Password" type="password" placeholder="••••" />);
    const input = screen.getByLabelText("Password");

    expect(input.getAttribute("type")).toBe("password");
    expect(input.getAttribute("placeholder")).toBe("••••");
  });
});

describe("surfaces", () => {
  it("Card renders its children", () => {
    render(
      <Card>
        <p>Inside a card</p>
      </Card>
    );

    expect(screen.getByText("Inside a card")).toBeDefined();
  });

  it("Panel renders its children", () => {
    render(
      <Panel>
        <p>Inside a panel</p>
      </Panel>
    );

    expect(screen.getByText("Inside a panel")).toBeDefined();
  });

  it("Card and Panel are visually distinct", () => {
    const { container: card } = render(<Card>x</Card>);
    const { container: panel } = render(<Panel>x</Panel>);

    expect(card.firstElementChild?.className).not.toBe(panel.firstElementChild?.className);
  });

  it.each(["neutral", "accent", "success", "warning", "blocked"] as const)(
    "Badge renders the %s tone",
    (tone) => {
      const { container } = render(<Badge tone={tone}>Status</Badge>);

      expect(container.textContent).toBe("Status");
      expect(container.firstElementChild?.className).toBeTruthy();
    }
  );

  it("gives each Badge tone a different class list", () => {
    // Tone carries meaning here -- success and blocked must not render the
    // same, or the color stops saying anything.
    const { container: success } = render(<Badge tone="success">x</Badge>);
    const { container: blocked } = render(<Badge tone="blocked">x</Badge>);

    expect(success.firstElementChild?.className).not.toBe(
      blocked.firstElementChild?.className
    );
  });
});

/*
 * Modal's dialog semantics.
 *
 * These are the part of a modal that shadow cannot express. Depth says "in
 * front" to someone looking at the screen and nothing at all to someone who is
 * not, so the role and the name are what actually make it a dialog -- and they
 * are exactly the kind of attribute a restyle drops without any visible trace.
 */
describe("Modal", () => {
  it("exposes itself as a modal dialog", () => {
    render(<Modal label="New Project">body</Modal>);
    const dialog = screen.getByRole("dialog");

    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  it("takes its accessible name from label", () => {
    render(<Modal label="New Project">body</Modal>);

    expect(screen.getByRole("dialog", { name: "New Project" })).toBeDefined();
  });

  it("prefers labelledBy over label so the visible title cannot drift", () => {
    render(
      <>
        <h2 id="title-id">Project limit reached</h2>
        <Modal labelledBy="title-id" label="ignored">
          body
        </Modal>
      </>
    );
    const dialog = screen.getByRole("dialog", { name: "Project limit reached" });

    // Both would otherwise apply, and aria-label would win over the heading.
    expect(dialog.getAttribute("aria-label")).toBeNull();
  });
});
