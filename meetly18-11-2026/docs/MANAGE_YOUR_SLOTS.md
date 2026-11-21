# Manage your slots

New host dashboard menu and URL: `/manage-slots`.

Lists active meetings created by others where the organizer granted the signed-in host self-scheduling permission. Includes meetings awaiting slots and meetings with slots already published. Shows an action-needed or slots-added status. Manage my slots opens the existing editor; saving preserves other hosts’ choices.

The list loads directly from calendly/scheduler_host_assignments, with manual refresh and no interval polling. Revoked permissions remove assignments on the organizer’s next successful save. Calendar checks and saving delegated slots retain the existing server validation.

Removed the duplicate panel from Event types. This update requires a frontend build and Hosting deployment only; existing self-scheduling backend functions must already be deployed.
