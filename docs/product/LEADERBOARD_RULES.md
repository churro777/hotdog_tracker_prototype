# Leaderboard Ranking Rules

## Overview

The Hot Dog Tracker leaderboard uses a tie-aware ranking system that properly handles contestants with equal scores.

## Ranking Logic

### Tie Handling Rules

1. **Ties occupy multiple positions**: When multiple contestants have the same score, they are all assigned the same rank, but subsequent ranks are adjusted accordingly.

2. **Rank calculation**: If N contestants are tied at a particular score, the next different score gets rank (current_rank + N).

### Detailed Scenarios for Review

**IMPORTANT**: Please review these scenarios carefully to ensure this matches the desired behavior.

#### Scenario 1: No ties (baseline)

- User A: 10 hot dogs → Rank 1 🥇
- User B: 8 hot dogs → Rank 2 🥈  
- User C: 6 hot dogs → Rank 3 🥉
- User D: 4 hot dogs → Rank 4

#### Scenario 2: Two users tied for first place

- User A: 10 hot dogs → Rank 2 🥈
- User B: 10 hot dogs → Rank 2 🥈
- User C: 8 hot dogs → Rank 3 🥉 (not rank 2, because ranks 1 and 2 are occupied by tied users)
- User D: 6 hot dogs → Rank 4

#### Scenario 3: Four users all tied at zero (current situation)

- User A: 0 hot dogs → Rank 4 (tied for 4th)
- User B: 0 hot dogs → Rank 4 (tied for 4th)
- User C: 0 hot dogs → Rank 4 (tied for 4th)
- User D: 0 hot dogs → Rank 4 (tied for 4th)

#### Scenario 4: Complex tie scenario

- User A: 15 hot dogs → Rank 1 🥇
- User B: 10 hot dogs → Rank 2 🥈 (tied for 2nd)
- User C: 10 hot dogs → Rank 2 🥈 (tied for 2nd)  
- User D: 10 hot dogs → Rank 2 🥈 (tied for 2nd)
- User E: 8 hot dogs → Rank 5 (ranks 2, 3, 4 are occupied by tied users)
- User F: 5 hot dogs → Rank 6

#### Scenario 5: Multiple tie groups

- User A: 20 hot dogs → Rank 1 🥇
- User B: 15 hot dogs → Rank 2 🥈 (tied for 2nd)
- User C: 15 hot dogs → Rank 2 🥈 (tied for 2nd)
- User D: 10 hot dogs → Rank 4 (tied for 4th)
- User E: 10 hot dogs → Rank 4 (tied for 4th)
- User F: 5 hot dogs → Rank 6

#### Scenario 6: Edge case - Everyone has different scores except bottom two

- User A: 20 hot dogs → Rank 1 🥇
- User B: 15 hot dogs → Rank 2 🥈
- User C: 10 hot dogs → Rank 3 🥉
- User D: 5 hot dogs → Rank 4 (tied for 4th)
- User E: 5 hot dogs → Rank 4 (tied for 4th)

## UI Considerations

### Medal Display

- **Gold medal (🥇)**: Only for rank 1
- **Silver medal (🥈)**: Only for rank 2  
- **Bronze medal (🥉)**: Only for rank 3
- **Number display**: For ranks 4 and above, show "#4", "#5", etc.

### Tie Indicators

- Contestants with the same rank should be clearly identifiable
- Consider visual indicators for tied positions (e.g., "Tied for 2nd place")

## Key Questions to Resolve

1. **Zero scores**: When all contestants have 0 hot dogs, should they be:
   - All tied for 4th place (or Nth place based on total contestants)

2. **Tie display**: How should we visually indicate ties?
   - Show identical medals/ranks for tied users
   - Add "Tied for Xth place" text
   - Use different styling for tied positions

3. **Medal logic**: When ties occur:
   - User cannot be tied for first place
   - Two users tied for 1st → both get 🥈, next user gets 🥉 (rank 3)
   - Three users tied for 1st → all get 🥉, next user gets rank 4
   - etc

## Implementation Notes (pending approval)

1. **Sorting**: Users are sorted by `totalCount` in descending order
2. **Rank calculation**: TBD based on approved scenarios above
3. **Display consistency**: Ensure tied users receive identical visual treatment
4. **Performance**: Ranking calculation should be efficient for reasonable contestant counts

## Business Logic

This ranking system ensures:

- **Fairness**: Equal performances receive equal recognition
- **Clarity**: Unambiguous position assignment
- **Intuitive behavior**: Matches common sports ranking conventions
- **Scalability**: Works for any number of contestants and tie scenarios
