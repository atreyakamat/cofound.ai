1. Design Philosophy

The interface should feel like:

a calm strategic workspace floating above an intelligent system.

The design communicates:

• clarity
• calm decision making
• structured thinking
• futuristic intelligence

The UI should feel similar to:

• Apple VisionOS panels
• macOS glass panels
• modern AI workspace tools

The experience must feel:

light, intelligent, premium, and distraction-free.

2. Core Visual Theme

The interface uses glassmorphism with realistic material simulation.

Key characteristics:

Frosted Glass Panels

Every primary UI container is a translucent glass panel.

Properties:

• semi-transparent background
• heavy background blur
• soft reflections
• thin borders
• layered shadows

Example style:

backdrop-blur: 20px
background: rgba(255,255,255,0.08)
border: 1px solid rgba(255,255,255,0.2)
Light Refraction

Background elements slightly distort when seen through glass.

This is achieved using:

• backdrop-filter blur
• layered gradients
• subtle overlay noise textures

Ambient Lighting

The background emits subtle lighting which reflects onto glass cards.

Use soft gradients:

• purple
• indigo
• blue
• teal

3. Color System
Primary Background Gradient
background:
radial-gradient(circle at 20% 20%, #6d5cff40, transparent 40%),
radial-gradient(circle at 80% 80%, #00d4ff30, transparent 40%),
linear-gradient(135deg, #0f0f1a, #1a1b2e)

Purpose:

Creates ambient lighting for glass reflections.

Glass Panel Color
rgba(255,255,255,0.06)

Used for:

• cards
• panels
• sidebars

Border Color
rgba(255,255,255,0.18)

Thin border gives glass edge highlight.

Text Colors

Primary text:

#FFFFFF

Secondary text:

rgba(255,255,255,0.65)

Muted text:

rgba(255,255,255,0.45)
Accent Color

Accent used for key actions.

Suggested:

Electric Purple

#8B5CF6

Secondary accent:

#22D3EE
4. Typography

Typography must feel modern and clean.

Recommended fonts:

Primary:

Inter

Alternative:

Satoshi

Font Scale
Usage	Size
Hero heading	36px
Page heading	28px
Section heading	20px
Body text	16px
Small text	14px
5. Layout System

The UI uses layered floating cards.

Layout style:

• centered content
• floating panels
• spacious padding
• large rounded corners

Global Layout

Structure:

Navbar
   |
Main Workspace
   |
Glass Panels
Page Width

Maximum container width:

1200px

Centered horizontally.

6. Global Glass Panel Style

This style is reused everywhere.

.glass-panel {
  backdrop-filter: blur(24px);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 16px;
  box-shadow:
    0 10px 30px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.2);
}
7. Motion and Interaction

Micro animations enhance depth.

Use Framer Motion.

Hover Effects

On hover:

• brightness increases
• blur increases slightly
• glow appears

Example:

hover:bg-white/10
hover:shadow-lg
hover:scale-[1.02]
Parallax

Background gradient layers move slightly with cursor movement.

Movement range:

5–10px

Creates depth illusion.

8. Main Screens

The product contains four main UI screens.

Screen 1 — Login Page

Purpose:

Simple entry into the system.

Layout:

Centered glass card.

Structure:

Background gradient
      |
Glass login card
      |
Email field
Password field
Login button

Card size:

400px width

Glass properties applied.

Screen 2 — Dashboard

Purpose:

View all decisions.

Layout:

Navbar
|
Dashboard Header
|
Decision Cards Grid
Dashboard Header

Glass panel containing:

• title
• "New Decision" button

Decision Cards

Each decision is a floating glass card.

Card content:

Title
Status
Date
Short description

Hover animation:

Card lifts slightly.

Screen 3 — New Decision Flow

This is the core experience.

Layout:

Centered reasoning workspace

Structure:

Decision Input Card
↓
AI Questions Panel
↓
Answer Inputs
↓
Analysis Panel
Decision Input Card

Glass panel containing:

• decision title field
• description textarea

AI Questions Panel

Displays generated questions.

Each question appears inside a glass sub-card.

Answer Input

Input field below each question.

Spacing between items:

24px
Screen 4 — Decision Analysis

Final output panel.

Structure:

Summary Card
Insights Card
Tradeoffs Card
Risks Card
Recommendation Card

Each is a separate glass card.

9. UI Components
Glass Card

Reusable component.

Properties:

• backdrop blur
• transparent fill
• rounded corners
• border highlight

Button

Primary button style:

Glass button with accent glow.

Example:

background: linear-gradient(135deg,#8B5CF6,#22D3EE)

Rounded corners:

12px

Hover glow:

box-shadow: 0 0 15px rgba(139,92,246,0.6)
Input Fields

Inputs also use subtle glass style.

Example:

bg-white/5
border-white/10
rounded-xl

Focus state:

border-purple-400
shadow-purple-400/20
10. Background Design

Background is extremely important for glassmorphism.

Include:

• gradient blobs
• subtle animated particles
• noise texture overlay

Example:

background:
radial-gradient(circle at 30% 30%, #7c3aed33, transparent 40%),
radial-gradient(circle at 80% 70%, #22d3ee22, transparent 40%),
#0f0f1a
11. Accessibility

Glass interfaces must maintain readability.

Rules:

Text contrast ratio > 4.5
Minimum font size 14px
Avoid extremely transparent panels.

12. Responsive Design

Breakpoints:

Device	Width
Mobile	<768px
Tablet	768–1024px
Desktop	>1024px

Cards stack vertically on mobile.

13. Implementation Stack

Frontend implementation uses:

Next.js
TailwindCSS
shadcn/ui
Framer Motion

14. Tailwind Utility Pattern

Example glass panel:

bg-white/10
backdrop-blur-xl
border border-white/20
rounded-2xl
shadow-xl
15. Visual Mood

The final UI should feel like:

an intelligent command center floating in glass.

Not:

• cluttered
• chat-heavy
• noisy

Instead:

• calm
• analytical
• premium

16. Future UI Enhancements

Possible additions later:

• animated thinking indicator
• AI pulse effect during reasoning
• decision timeline visualization
• ambient lighting reacting to activity