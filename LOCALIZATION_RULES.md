# T1D Localization Rules

All user-facing text in `apps/t1d` must stay synchronized across every supported language:

- `en`
- `ru`
- `uk`
- `es`
- `fr`
- `de`
- `zh`
- `ja`
- `pt`
- `he`
- `ar`

Required rule:

- Whenever text is added or changed in the T1D project, update that same text in every supported language in the same change.

Scope:

- UI labels
- headings
- buttons
- form text
- helper text
- empty states
- error messages
- dashboard content
- route-level loading states

Implementation expectation:

- Prefer typed `Record<Language, ...>` dictionaries over ad hoc string literals.
- Avoid adding new hardcoded user-facing strings directly into JSX.
- If backend payloads contain user-facing copy, provide a frontend translation map or move that copy into a localized dictionary.
