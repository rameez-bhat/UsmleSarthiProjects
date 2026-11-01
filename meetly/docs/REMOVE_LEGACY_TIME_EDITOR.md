# Remove the old individual time editor

The old Date & time N fieldsets and Add another date and time button are removed. Scheduling now uses each host's single/multiple/range date and time cards, whose previews are included directly by Save.

Existing saved appointment records are retained. A collapsed Existing saved appointments section allows review and removal without showing the old entry fields. To change saved availability, remove unwanted saved choices and enter replacement choices in the host card before Save.

This is a frontend-only update. Rebuild and deploy Hosting from the updated frontend project, preserving your actual Firebase configuration:

```sh
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

77 backend and 63 frontend tests passed, including assertions that legacy fieldsets and add-time controls are absent. Production build passed. Real-device visual inspection and live integrations were not exercised.
