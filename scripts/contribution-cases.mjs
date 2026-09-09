import test from "node:test";
import assert from "node:assert/strict";

function createContribution({ goalId, userId, amount, note, isHistorical }) {
  return {
    goalId,
    userId,
    amount,
    note,
    isHistorical,
    includedInGoalTotal: true,
    createdAt: new Date(),
  };
}

function applyContribution({ goal, contribution, authenticatedUserId }) {
  if (goal.userId !== authenticatedUserId || contribution.userId !== authenticatedUserId) {
    throw new Error("Unauthorized");
  }

  if (contribution.goalId !== goal.id) {
    throw new Error("Goal not found");
  }

  if (!contribution.isHistorical) {
    if (goal.currentAmount + contribution.amount > goal.targetAmount) {
      throw new Error("Contribution exceeds target");
    }
    goal.currentAmount += contribution.amount;
  }

  return goal;
}

test("normal contribution increases the goal total exactly once", () => {
  const goal = { id: "goal-1", userId: "user-a", targetAmount: 10000, currentAmount: 2000 };
  const contribution = createContribution({ goalId: "goal-1", userId: "user-a", amount: 500, isHistorical: false });
  applyContribution({ goal, contribution, authenticatedUserId: "user-a" });
  assert.equal(goal.currentAmount, 2500);
  assert.equal(contribution.isHistorical, false);
  assert.equal(contribution.includedInGoalTotal, true);
});

test("historical contribution already included in total does not change the goal", () => {
  const goal = { id: "goal-1", userId: "user-a", targetAmount: 500000, currentAmount: 405713 };
  const contribution = createContribution({ goalId: "goal-1", userId: "user-a", amount: 5000, isHistorical: true });
  applyContribution({ goal, contribution, authenticatedUserId: "user-a" });
  assert.equal(goal.currentAmount, 405713);
  assert.equal(contribution.createdAt instanceof Date, true);
});

test("client createdAt cannot override the server timestamp", () => {
  const clientCreatedAt = "2000-01-01T00:00:00.000Z";
  const contribution = createContribution({ goalId: "goal-1", userId: "user-a", amount: 50, isHistorical: false, createdAt: clientCreatedAt });
  assert.notEqual(contribution.createdAt, clientCreatedAt);
  assert.equal(contribution.createdAt instanceof Date, true);
});

test("history sorts newest first", () => {
  const history = [
    { createdAt: new Date("2026-09-09T10:00:00Z") },
    { createdAt: new Date("2026-09-09T12:00:00Z") },
  ].sort((a, b) => b.createdAt - a.createdAt);
  assert.equal(history[0].createdAt.toISOString(), "2026-09-09T12:00:00.000Z");
});

test("another user cannot access the contribution or goal", () => {
  const goal = { id: "goal-1", userId: "user-a", targetAmount: 1000, currentAmount: 0 };
  const contribution = createContribution({ goalId: "goal-1", userId: "user-a", amount: 50, isHistorical: false });
  assert.throws(() => applyContribution({ goal, contribution, authenticatedUserId: "user-b" }), /Unauthorized/);
});

test("over-target contribution is rejected", () => {
  const goal = { id: "goal-1", userId: "user-a", targetAmount: 1000, currentAmount: 900 };
  const contribution = createContribution({ goalId: "goal-1", userId: "user-a", amount: 101, isHistorical: false });
  assert.throws(() => applyContribution({ goal, contribution, authenticatedUserId: "user-a" }), /exceeds target/);
});
