export type GoalStatus =
    | "Just started"
    | "Progress ongoing"
    | "Almost there"
    | "Near completion"
    | "Congratulations — goal achieved";

export function getGoalProgress(
    current: number,
    target: number
) {
    if (target <= 0) {
        return 0;
    }

    return Math.min(Math.round((current / target) * 100), 100);
}

export function getGoalStatus(progress: number) {
    if (progress >= 100) {
        return "Congratulations — goal achieved";
    }

    if (progress >= 76) {
        return "Near completion";
    }

    if (progress >= 51) {
        return "Almost there";
    }

    if (progress >= 26) {
        return "Progress ongoing";
    }

    return "Just started";
}