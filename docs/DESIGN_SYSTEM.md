# Sport DH - Design System

## Overview

Sport DH sử dụng design system hiện đại, năng động với dark theme và màu sắc rực rỡ phù hợp với ngành thể thao.

## Color Palette

### Primary Colors

**Vibrant Orange** - `#FF6B35`
- Sử dụng cho: Main CTAs, primary actions, energy
- Gradient: `from-primary to-primary/60`
- Hover shadow: `shadow-primary/20`

**Electric Blue** - `#0EA5E9`
- Sử dụng cho: Secondary actions, trust elements
- Gradient: `from-secondary to-secondary/60`
- Hover shadow: `shadow-secondary/20`

**Bright Green** - `#10B981`
- Sử dụng cho: Success states, availability indicators
- Gradient: `from-accent to-accent/60`
- Hover shadow: `shadow-accent/20`

### Neutral Colors

**Dark Slate** - `#0F172A`
- Background color
- Creates dramatic, modern feel

**Lighter Slate** - `#1E293B`
- Card backgrounds
- Elevated surfaces

**Muted** - `#334155`
- Borders, inputs
- Disabled states

**Muted Foreground** - `#94A3B8`
- Secondary text
- Placeholders

**Foreground** - `#F8FAFC`
- Primary text color
- High contrast on dark background

## Typography

### Font Family

**Inter** - Primary font
- Excellent Vietnamese character support
- Clean, modern sans-serif
- Variable font with multiple weights

\`\`\`css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
\`\`\`

### Font Weights

- **Black (900)**: Headings, hero text
- **Bold (700)**: Subheadings, buttons, emphasis
- **Semibold (600)**: Card titles
- **Normal (400)**: Body text

### Font Sizes

\`\`\`
text-5xl (3rem)    - Hero headings mobile
text-6xl (3.75rem) - Hero headings tablet
text-7xl (4.5rem)  - Hero headings desktop
text-4xl (2.25rem) - Section headings
text-3xl (1.875rem) - Subsection headings
text-2xl (1.5rem)  - Card titles
text-xl (1.25rem)  - Large body text
text-lg (1.125rem) - Body text
text-base (1rem)   - Default text
\`\`\`

### Line Height

- **Headings**: `leading-tight` (1.25)
- **Body**: `leading-relaxed` (1.625)
- **Descriptions**: `leading-normal` (1.5)

## Components

### Cards

\`\`\`tsx
<Card className="group border-2 transition-all hover:border-primary hover:shadow-2xl hover:shadow-primary/20">
  {/* Content */}
</Card>
\`\`\`

**Features**:
- `border-2` for emphasis
- Hover effects with colored borders
- Colored shadows on hover
- Group for coordinated child animations

### Buttons

\`\`\`tsx
<Button className="font-bold">
  Action
</Button>
\`\`\`

**Variants**:
- Default: Primary color background
- Outline: Transparent with border
- Secondary: Secondary color background

**Sizes**:
- `size="lg"`: h-14, px-8, text-lg
- Default: h-10, px-4, text-base
- `size="sm"`: h-8, px-3, text-sm

### Images

\`\`\`tsx
<div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
  <img 
    src={imageUrl || "/placeholder.svg"}
    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
</div>
\`\`\`

**Features**:
- Gradient background fallback
- Hover scale effect
- Overlay gradient for text readability
- Smooth transitions

### Badges

\`\`\`tsx
<Badge className="bg-primary font-bold text-primary-foreground">
  Label
</Badge>
\`\`\`

**Usage**:
- Price tags
- Status indicators
- Count displays

### Hero Sections

\`\`\`tsx
<section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20 py-20">
  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
  <div className="container relative mx-auto px-4">
    {/* Content */}
  </div>
</section>
\`\`\`

**Features**:
- Gradient backgrounds
- Grid pattern overlay
- Relative positioning for layering
- Generous padding

## Layout

### Container

\`\`\`tsx
<div className="container mx-auto px-4">
  {/* Content */}
</div>
\`\`\`

### Grid Layouts

**Sport Centers** (3 columns):
\`\`\`tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
\`\`\`

**Sport Fields** (4 columns):
\`\`\`tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
\`\`\`

**Features** (3 columns):
\`\`\`tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
\`\`\`

### Spacing

- **Section padding**: `py-20` (5rem)
- **Card padding**: `p-6` (1.5rem)
- **Gap**: `gap-6` (1.5rem) for grids
- **Button padding**: `px-8 py-4` for large buttons

## Responsive Design

### Breakpoints

- **sm**: 640px - Mobile landscape, small tablets
- **md**: 768px - Tablets
- **lg**: 1024px - Desktop
- **xl**: 1280px - Large desktop

### Mobile-First Approach

\`\`\`tsx
// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 3 columns
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
\`\`\`

## Animations

### Transitions

\`\`\`css
transition-all        /* All properties */
transition-transform  /* Transform only */
transition-shadow     /* Shadow only */
\`\`\`

### Durations

- Default: 150ms
- Slow: `duration-500` (500ms) for images

### Hover Effects

\`\`\`tsx
// Scale on hover
group-hover:scale-110

// Border color change
hover:border-primary

// Shadow appearance
hover:shadow-2xl hover:shadow-primary/20
\`\`\`

## Accessibility

### Color Contrast

- All text meets WCAG AA standards
- Minimum 4.5:1 contrast ratio for body text
- Minimum 3:1 for large text

### Focus States

- Visible focus rings on all interactive elements
- `outline-ring/50` for focus indicators

### Screen Readers

- Semantic HTML elements
- ARIA labels where needed
- Alt text for all images

## Vietnamese Language Support

### Font Selection

Inter font chosen specifically for:
- Complete Vietnamese character set
- Proper diacritic rendering
- Consistent letter spacing
- Professional appearance

### Text Rendering

- `leading-relaxed` for better diacritic spacing
- Adequate line-height prevents overlap
- `text-balance` for optimal line breaks
- `text-pretty` for important copy

## Best Practices

### Do's

✅ Use bold typography for impact
✅ Apply colored shadows on hover
✅ Use gradients for backgrounds
✅ Maintain consistent spacing
✅ Use Inter font for Vietnamese text
✅ Apply border-2 for emphasis
✅ Use semantic color meanings

### Don'ts

❌ Don't use Geist font (poor Vietnamese support)
❌ Don't use single color schemes
❌ Don't skip hover states
❌ Don't use small font sizes for Vietnamese
❌ Don't forget image overlays
❌ Don't use thin borders (use border-2)
❌ Don't mix too many colors

## Examples

### Feature Card

\`\`\`tsx
<Card className="group border-2 transition-all hover:border-primary hover:shadow-xl hover:shadow-primary/20">
  <CardHeader>
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60">
      <Icon className="h-8 w-8 text-white" />
    </div>
    <CardTitle className="text-2xl">Title</CardTitle>
    <CardDescription className="text-base">
      Description text
    </CardDescription>
  </CardHeader>
</Card>
\`\`\`

### Sport Center Card

\`\`\`tsx
<Card className="group overflow-hidden border-2 transition-all hover:border-primary hover:shadow-2xl hover:shadow-primary/20">
  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
    <img
      src={imageUrl || "/placeholder.svg"}
      alt={name}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
    <Badge className="absolute right-3 top-3 bg-primary font-bold">
      {count} sân
    </Badge>
  </div>
  <CardHeader>
    <CardTitle className="line-clamp-1 text-xl">{name}</CardTitle>
    <CardDescription className="flex items-start gap-2 text-base">
      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <span className="line-clamp-2">{address}</span>
    </CardDescription>
  </CardHeader>
  <CardFooter>
    <Button asChild className="w-full font-bold">
      <Link href={`/sport-centers/${id}`}>Xem chi tiết</Link>
    </Button>
  </CardFooter>
</Card>
