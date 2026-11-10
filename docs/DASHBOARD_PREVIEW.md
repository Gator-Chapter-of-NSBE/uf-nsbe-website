# Dashboard role preview

Administrators have a **Preview dashboard as** selector above their dashboard.
Choose Admin, E-board or Member and select **View dashboard**. Only real admin
accounts can activate a preview; adding a preview query parameter as a member or
E-board user does not change the displayed role or grant permissions.

The preview uses the exact same dashboard, metric, history and feature components
as normal visits, with the admin's own member data. There is no duplicated demo
dashboard. Role-specific display checks use `resolvePortalView`; the actual session
and database authorization remain unchanged.

A banner identifies the simulated role and offers **Exit preview**. Semester
changes, the profile page, leaderboard and E-board event tools preserve preview
through their URLs. Profile and event forms are disabled, sign-out within the
preview content is disabled, and the preview shell intercepts mutation submissions
and action buttons. GET filters and the calendar-source links remain navigable.
Member preview does not expose staff tools. E-board preview includes read-only
member participation and previous-event directories, while omitting correction
forms, sensitive IDs, exports, role controls and the administrator directory.

The preview is temporary: it uses `?preview=member` or `?preview=eboard`, not a
cookie, database role or persistent preference. A fresh `/portal` visit or **Exit
preview** returns to the actual dashboard. The selector itself is a preview control
and remains visible to the real admin in either preview.

## Future features

Add new dashboard content to the existing dashboard normally so it appears in
previews automatically. Server components should use the resolved `view` for
presentation (`showAdmin`, `showEventManagement`, `role`, `readOnly`). Client
components can use `usePortalView()` inside `PortalViewShell` for the same values.
Keep real session/database permission checks for authorization.

Wrap new mutating forms in a disabled fieldset when `view.readOnly`, or disable
their actions with that flag. The shell also blocks mutation forms and action
buttons, including dynamically added controls, as a UI safeguard. New interactive
features should respect the same read-only flag. A purely local display button
such as a layout toggle may use `data-preview-safe`; never mark a mutation safe.
New navigable portal pages must preserve the preview parameter, adopt the shell,
and be registered in its allowed-route list before exploration in preview is enabled.
Links outside supported preview pages are blocked inside the preview content.

This is an interface preview, not impersonation or a security sandbox. It does not
simulate database RLS as a different user and cannot replace permission tests or
test accounts. Global site navigation outside the preview content still represents
the actual signed-in account. No SQL migration or new environment variables are
needed. Deploy the code to Vercel normally.
