# Activity Completion Flow (Post-Refactor)

This document details the state-driven flow for handling activity completion, results display, conclusion dialogs, and mission updates in the AI Literacy Game. This flow was refactored to address issues with inconsistent state transitions and ensure a robust user experience.

## Core Components Involved:

1.  **`ActivityContainer.tsx`**: Orchestrates the UI and logic visible during an active activity, including rendering questions and the results screen. It initiates the post-results sequence.
2.  **`DialogSystem.tsx`**: Responsible for rendering all modal dialogs, including intro dialogs and conclusion dialogs. For conclusion dialogs, it primarily displays content and forwards navigation actions.
3.  **`activitySlice.ts`**: Manages the Redux state for the current activity, including question progression, scores, and flags that drive the completion flow (`showResults`, `conclusionDialogActive`, `activityCompletedUnderway`). It contains reducers and thunks to process activity events.
4.  **`uiSlice.ts`**: Manages the Redux state for UI elements like dialog visibility (`dialogOpen`, `dialogData`).
5.  **`moduleSlice.ts`**: Manages the Redux state for modules and their associated missions, including marking missions as complete.

## Ideal Flow (Step-by-Step):

The flow begins after the player has answered all questions in an activity.

1.  **All Questions Answered:**
    *   In `activitySlice.ts`, the `answerQuestion` reducer (or `nextQuestion` if it's the last question) sets `state.showResults = true`.
    *   **Log Trigger:** `[activitySlice] ... setting showResults = true`

2.  **Results Screen Appears:**
    *   `ActivityContainer.tsx` re-renders.
    *   The condition `if (showResults)` becomes true.
    *   `contentToRender` in `ActivityContainer` becomes the `ResultsContainer` JSX.
    *   The player sees their score and completion points.
    *   **Log Trigger:** `Activity state updated in ActivityContainer {... showResults: true ...}`

3.  **Player Clicks "Continue" on Results Screen:**
    *   The `onClick` handler for the "Continue" button in `ActivityContainer` (`handleContinueFromResults`) is triggered.
    *   `handleContinueFromResults` dispatches the `hideResults()` action from `activitySlice.ts`.
    *   **Log Trigger:** `[ActivityContainer] Continue from results clicked.`

4.  **`hideResults` Reducer Processes:**
    *   `activitySlice.ts` `hideResults` reducer is executed.
    *   It sets `state.showResults = false`.
    *   It checks if `state.currentActivity.conclusion` exists:
        *   **If conclusion exists:** Sets `state.conclusionDialogActive = true`.
            *   **Log Triggers:**
                *   `[activitySlice] hideResults: Initial state ...`
                *   `[activitySlice] hideResults: Conclusion exists. SET conclusionDialogActive = true`
                *   `[activitySlice] hideResults: Final state {... showResults: false, conclusionDialogActive: true ...}`
        *   **If no conclusion:** Sets `state.activityCompletedUnderway = true` (skipping to step 8 logic).
            *   **Log Triggers:**
                *   `[activitySlice] hideResults: Initial state ...`
                *   `[activitySlice] hideResults: No conclusion. SET activityCompletedUnderway = true`
                *   `[activitySlice] hideResults: Final state {... showResults: false, activityCompletedUnderway: true ...}`

5.  **`ActivityContainer` Reacts to State Change (Conclusion Path):**
    *   `ActivityContainer.tsx` re-renders due to `showResults` and `conclusionDialogActive` changing in the Redux state.
    *   The main render condition `active && !conclusionDialogActive` in `ActivityContainer` becomes `true && false` (if conclusion exists), so the `ActivityContainer`'s `<Overlay>` (results screen UI) effectively hides or doesn't render.
    *   The `useEffect` hook in `ActivityContainer` monitoring `conclusionDialogActive` fires because `conclusionDialogActive` is now `true`.
    *   This `useEffect` dispatches `openDialog()` from `uiSlice.ts` with:
        *   `type: 'conclusion'`
        *   `title: 'Activity Complete'`
        *   `content: currentActivity.conclusion`
        *   `completeAction: { type: 'activity/markConclusionDialogFinished' }` (This is crucial: the dialog's "end" will trigger this action type string).
    *   **Log Triggers:**
        *   `Activity state updated in ActivityContainer {... showResults: false, conclusionDialogActive: true ...}`
        *   `[ActivityContainer] Conclusion dialog is active, suppressing question/results rendering.` (if `contentToRender` logic is hit)
        *   `[ActivityContainer] Conclusion dialog active, opening dialog.`

6.  **`DialogSystem` Displays Conclusion Dialog:**
    *   `DialogSystem.tsx` re-renders because `state.ui.dialogOpen` is now `true` and `state.ui.dialogData` is populated.
    *   It identifies `dialogData.type === 'conclusion'`.
    *   It uses `renderConclusionDialogContent()` to display the NPC speaker, conclusion text (potentially multi-page, navigable with `contentIndex`).
    *   The "Next" / "Finish" button in the conclusion dialog is wired to `DialogSystem`'s `handleNext` function.
    *   **Log Trigger:** `[DialogSystem] Dialog opened/changed {type: 'conclusion', ...}`

7.  **Player Navigates and Finishes Conclusion Dialog:**
    *   Player clicks "Next" (if multi-page) or "Finish" on the last page of the conclusion dialog.
    *   `DialogSystem.tsx`'s `handleNext` function is called.
    *   Recognizing it's the last content for a 'conclusion' type dialog, `handleNext` dispatches the `markConclusionDialogFinished()` action (this is the string `'activity/markConclusionDialogFinished'` which `ActivityContainer` set up as the `completeAction`).
    *   `handleNext` then dispatches `closeDialog()` from `uiSlice.ts`.
    *   **Log Triggers:**
        *   `[DialogSystem] handleNext {type: 'conclusion', isLastContent: true, ...}`
        *   `[DialogSystem] Conclusion dialog finished, dispatching markConclusionDialogFinished.`

8.  **`markConclusionDialogFinished` Reducer Processes:**
    *   `activitySlice.ts` `markConclusionDialogFinished` reducer is executed.
    *   It sets `state.conclusionDialogActive = false`.
    *   It sets `state.activityCompletedUnderway = true`. This flag now signals that all pre-completion UI (results, conclusion dialog) is done, and actual completion logic can proceed.
    *   **Log Triggers:**
        *   `[activitySlice] markConclusionDialogFinished: Initial state ...`
        *   `[activitySlice] markConclusionDialogFinished: Final state {... conclusionDialogActive: false, activityCompletedUnderway: true ...}`

9.  **`ActivityContainer` Reacts to `activityCompletedUnderway`:**
    *   `ActivityContainer.tsx` re-renders.
    *   The `useEffect` hook monitoring `activityCompletedUnderway` fires because `activityCompletedUnderway` is now `true`.
    *   This `useEffect` dispatches the `completeCurrentActivityAndMission()` thunk from `activitySlice.ts`.
    *   **Log Triggers:**
        *   `Activity state updated in ActivityContainer {... conclusionDialogActive: false, activityCompletedUnderway: true ...}`
        *   `[ActivityContainer] Activity completion underway, dispatching thunk.`

10. **`completeCurrentActivityAndMission` Thunk Executes:**
    *   This thunk in `activitySlice.ts` is the final orchestrator.
    *   It first dispatches `finalizeActivityCompletion()` action.
        *   **`finalizeActivityCompletion` Reducer:** Updates `state.score` with completion points and adds `currentActivity.id` to the `state.completed` array.
        *   **Log Trigger (from reducer):** `[activitySlice] finalizeActivityCompletion: ...`
    *   It then determines the `missionToCompleteId` based on `currentActivity.missionId`, `currentActivity.id`, or by searching `moduleSlice.currentModule.missions` for a mission whose `activityId` matches `currentActivity.id`.
    *   If a `missionToCompleteId` is found, it dispatches `completeMission(missionToCompleteId)` from `moduleSlice.ts`.
        *   `moduleSlice.completeMission` updates the mission's status and the `module.completedMissions` array. This will trigger UI updates in components listening to mission state (e.g., Mission Tracker).
        *   **Log Trigger:** `[activitySlice Thunk] Dispatching completeMission ...`
    *   After a short `setTimeout` (to allow other state updates like mission completion to propagate for UI consistency if needed), it dispatches `closeActivity()`.
        *   **`closeActivity` Reducer:** Resets `currentActivity` to `null`, `active` to `false`, and other activity-related states.
        *   **Log Trigger (from reducer):** `[activitySlice] closeActivity`
    *   **Log Triggers (from thunk):**
        *   `[activitySlice Thunk] completeCurrentActivityAndMission: START ...`
        *   `[activitySlice Thunk] Dispatching closeActivity (UI)`
        *   `[activitySlice Thunk] completeCurrentActivityAndMission: END`

11. **Activity UI Closes & Player Returns to Game World:**
    *   `ActivityContainer.tsx` re-renders. Since `state.activity.active` is now `false`, `ActivityContainer` returns `null` and disappears from the UI.
    *   The player is back in the game world.
    *   Mission tracker UI (if any) reflects the completed mission.

This detailed sequence, driven by specific state flags and React `useEffect` hooks, ensures each step proceeds in the correct order and that UI components are only responsible for their designated parts of the flow.

## Unified Dialog Rendering (Post-Refactor)

A significant refinement was made to how dialogs, including conclusion dialogs, are rendered to ensure UI consistency and simplify logic.

### Core Changes:

1.  **`DialogSystem.tsx` Refactor:**
    *   The `renderConclusionDialogContent` function was removed.
    *   A single, unified rendering path within `DialogSystem.tsx` now handles all dialog types (`npc` intro, `object`, `conclusion`, etc.).
    *   The main dialog title (`DialogTitle`) is always populated from `dialogData.title`.
    *   The `DialogSpeakerContainer` (which includes the `DialogPortrait` and `DialogSpeaker` name) is displayed based on:
        *   Presence of `dialogData.portraitUrl` (for the image).
        *   OR if `dialogData.speaker` is provided and is different from `dialogData.title`.
    *   Crucially, the `DialogSpeaker` text (the name appearing next to/below the portrait) only renders if `dialogData.speaker` is actually different from `dialogData.title`. This prevents name duplication when they are intentionally set to be the same.

2.  **`ActivityContainer.tsx` for Conclusion Dialogs:**
    *   When a conclusion dialog needs to be shown, `ActivityContainer.tsx` now fetches the relevant NPC's details (name and `assetPath`).
    *   It dispatches `openDialog` with:
        *   `type: 'conclusion'`
        *   `title: npc.name` (NPC's name becomes the main dialog title)
        *   `speaker: npc.name` (NPC's name is also set as the speaker)
        *   `portraitUrl: npc.assetPath` (Path to the NPC's image for the portrait)
        *   `content: currentActivity.conclusion`

### Impact on Conclusion Dialog Layout:

*   The NPC's name appears once as the main `DialogTitle`.
*   If an `assetPath` (and thus `portraitUrl`) is available for the NPC, their portrait is displayed below the title.
*   Because `title` and `speaker` are the same, the `DialogSpeaker` text is not rendered, avoiding redundancy.
*   The conclusion text follows, and then the appropriate action button (e.g., "Finish").
*   This aligns the visual structure of conclusion dialogs more closely with other NPC interaction dialogs, providing a consistent user experience and removing previous layout issues like excessive spacing.

### Prevention of UI Flickering:

*   `ActivityContainer.tsx` was further refined to prevent flickering of the main activity UI or the last question UI after the conclusion dialog closes and before the activity fully deactivates.
*   This was achieved by ensuring the main activity `Overlay` and the question rendering logic (`contentToRender`) consider the `activityCompletedUnderway` state flag, effectively hiding themselves once the activity is in its final teardown phase.

### Points Awarding Logic (Module Points)

To provide timely feedback, the total points for an activity (question points + completion points) are added to the current module's total points as soon as the player reaches the **Results Screen** for that activity.

1.  **`moduleSlice.ts` (`currentModulePoints`):**
    *   The `moduleSlice` holds a `currentModulePoints: number` state, initialized to 0.
    *   An action `addPointsToCurrentModule(points: number)` increments this state.
    *   This state is reset to 0 when a new module is selected or when module progress is reset.

2.  **`ActivityContainer.tsx` (Point Awarding Trigger):
    *   A `useEffect` hook in `ActivityContainer.tsx` observes the `showResults` flag (from `activitySlice`) and the `score` (from questions).
    *   When `showResults` becomes `true` for an activity:
        1.  `ActivityContainer.tsx` first dispatches `finalizeActivityCompletion()` from `activitySlice`. This action is responsible for adding the `currentActivity.completionPoints` to the `activity.score` within the `activitySlice`'s state. This ensures the `activity.score` now reflects the total points for the questions plus the completion bonus for that specific activity session.
        2.  Immediately after, `ActivityContainer.tsx` calculates the total points for the activity: `pointsFromQuestionsBeforeFinalize + completionPoints`. (Note: the `score` selector might not update in the same tick, so it explicitly uses the question score it had plus completion points for clarity in its calculation for dispatch).
        3.  It then dispatches `addPointsToCurrentModule(totalPointsForActivity)` using the action from `moduleSlice`.
    *   A `useRef` flag (`pointsAwardedForCurrentResults`) within `ActivityContainer.tsx` ensures that points for a single instance of the results screen being displayed are only awarded once, preventing accidental double-counting on re-renders.

3.  **`activitySlice.ts` (`completeCurrentActivityAndMission` Thunk):
    *   The responsibility of dispatching `addPointsToCurrentModule` was **removed** from this thunk. It still calls `finalizeActivityCompletion` to update the local activity score for consistency, but the module points are now handled earlier by `ActivityContainer.tsx`.

4.  **`PointsTracker.tsx` (UI Display):
    *   This UI component (typically part of the `HUD.tsx`) selects `currentModulePoints` from the `moduleSlice` and displays it, providing the player with a real-time view of their accumulated points for the currently active module.

This change ensures that the player sees their module points update immediately upon completing the questions of an activity and seeing their results, rather than waiting for the entire activity flow (including conclusion dialogs) to finish.

### Module Timer and Bonus Points

To add an element of challenge and reward timely completion, a module-specific timer has been implemented.

1.  **Timer Initiation and Display (`moduleSlice.ts`, `Timer.tsx`, `HUD.tsx`):
    *   When a module is selected (via `setCurrentModule` in `moduleSlice.ts`), a timer is initiated with a default duration (e.g., 10 minutes).
    *   State properties in `moduleSlice.ts` track the `moduleStartTime`, `initialDuration_ms`, `timeRemaining_ms`, and `timerActive` status.
    *   The `Timer.tsx` component subscribes to this state. It uses an interval to dispatch `tickTimer()` action (from `moduleSlice.ts`) every second, which decrements `timeRemaining_ms`.
    *   `Timer.tsx` displays the `timeRemaining_ms` formatted as MM:SS.
    *   If `timeRemaining_ms` drops below 2 minutes, the timer display changes to an urgent style (flashing red text) to create a sense of urgency.
    *   The `<Timer />` component is rendered in `HUD.tsx` as part of the `RightSideUIContainer`, typically appearing above the Mission Tracker.

2.  **Bonus Points Logic (`moduleSlice.ts`):
    *   When all missions for the current module are completed (detected within the `completeMission` reducer in `moduleSlice.ts`):
        1.  The `timerActive` flag is set to `false` to stop the countdown.
        2.  The system checks if `timeRemaining_ms > 0`.
        3.  If there is time remaining, 50 bonus points are added to `currentModulePoints`.
        4.  A `bonusAwardedMessage` state is set (e.g., "Module Complete! Time Bonus: +50 Points!" or "Module Complete! No time bonus.").

3.  **Displaying Bonus Message (`ModuleCompletionModal.tsx`):
    *   The `ModuleCompletionModal.tsx` component (triggered by `showCompletionModal` flag in `moduleSlice.ts`) now subscribes to `bonusAwardedMessage`.
    *   If a `bonusAwardedMessage` is present, it is displayed prominently within the modal, informing the player about the time bonus (or lack thereof).
    *   The `bonusAwardedMessage` is cleared when the modal is closed (via `setShowCompletionModal(false)`).

4.  **Timer Reset:
    *   The timer state (including `timeRemaining_ms`, `timerActive`, etc.) is reset when a new module is selected or when `resetModuleProgress` is dispatched.

5.  **HUD Layout (`HUD.tsx`):
    *   The `HUD.tsx` was refactored to better organize UI elements:
        *   A `DebugToggleContainer` was introduced to separately position the debug toggle button at the top-right.
        *   The `RightSideUIContainer` (absolutely positioned below the debug toggle and with a fixed width of `280px`) now hosts the `Timer`, `MissionTracker`, and `PointsTracker` in a vertical stack. This fixed overlapping issues and restored `MissionTracker` collapsibility. 