# ChatGPT-Style UI Component Library

A comprehensive, modern UI component library for React applications, inspired by ChatGPT's clean and professional design.

## Design Principles

- **Clean Typography**: 16-18px body text with Inter font
- **Generous Spacing**: 24-48px padding for comfortable layouts
- **Soft Rounded Corners**: 8-16px border radius for modern feel
- **Subtle Shadows**: Layered shadows for depth without harshness
- **Smooth Animations**: 200ms cubic-bezier transitions
- **Neutral Colors**: Gray palette with accent green (#10A37F)
- **Accessibility**: Full keyboard navigation and ARIA support
- **Responsive**: Mobile-first design with breakpoints

## Installation

All components are available from a single import:

```typescript
import { Button, Modal, Input, Card } from '@/components/ui'
```

## Components

### Button

Versatile button component with multiple variants and states.

```tsx
import { Button, IconButton } from '@/components/ui'
import { Add as AddIcon } from '@mui/icons-material'

// Primary button
<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>

// With icon
<Button
  variant="secondary"
  icon={<AddIcon />}
  iconPosition="left"
>
  Add Item
</Button>

// Loading state
<Button loading={isSubmitting}>
  Submit Form
</Button>

// Icon-only button
<IconButton
  icon={<AddIcon />}
  aria-label="Add item"
  variant="ghost"
/>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `icon`: ReactNode
- `iconPosition`: 'left' | 'right'
- `fullWidth`: boolean

---

### Modal

Full-featured modal with backdrop blur and animations.

```tsx
import { Modal, Button } from '@/components/ui'

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="secondary" onClick={handleClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed with this action?</p>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `showCloseButton`: boolean (default: true)
- `closeOnBackdropClick`: boolean (default: true)
- `closeOnEscape`: boolean (default: true)
- `footer`: ReactNode

---

### Dropdown

Searchable dropdown with keyboard navigation.

```tsx
import { Dropdown } from '@/components/ui'
import { Person as PersonIcon } from '@mui/icons-material'

const options = [
  { value: '1', label: 'Admin', icon: <PersonIcon /> },
  { value: '2', label: 'User' },
  { value: '3', label: 'Guest', disabled: true }
]

<Dropdown
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  label="User Role"
  placeholder="Select a role"
  error={formErrors.role}
/>
```

**Props:**
- `options`: DropdownOption[]
- `value`: string
- `onChange`: (value: string) => void
- `placeholder`: string
- `label`: string
- `error`: string
- `disabled`: boolean

---

### Input & TextArea

Modern input fields with icons and validation states.

```tsx
import { Input, TextArea } from '@/components/ui'
import { Search as SearchIcon } from '@mui/icons-material'

// Text input with icon
<Input
  label="Search"
  placeholder="Search items..."
  leftIcon={<SearchIcon />}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  fullWidth
/>

// Input with error
<Input
  label="Email"
  type="email"
  error="Please enter a valid email"
  helperText="We'll never share your email"
/>

// TextArea
<TextArea
  label="Description"
  rows={4}
  placeholder="Enter description..."
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  fullWidth
/>
```

**Input Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `fullWidth`: boolean

---

### Toast

Auto-dismissing notifications with progress bar.

```tsx
import { Toast, ToastContainer } from '@/components/ui'

// Single toast
<Toast
  type="success"
  message="Changes saved successfully"
  description="Your profile has been updated"
  duration={5000}
  onClose={() => setShowToast(false)}
/>

// Toast container (manages multiple toasts)
<ToastContainer
  toasts={toasts}
  onRemove={(id) => removeToast(id)}
/>
```

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info'
- `message`: string
- `description`: string
- `duration`: number (milliseconds, 0 for no auto-dismiss)
- `position`: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'

---

### Badge

Labels and status indicators.

```tsx
import { Badge, DotBadge, CounterBadge } from '@/components/ui'
import { CheckCircle as CheckIcon } from '@mui/icons-material'

// Standard badge
<Badge variant="success" icon={<CheckIcon />}>
  Active
</Badge>

// Pill badge
<Badge variant="primary" rounded>
  New
</Badge>

// Dot badge (status indicator)
<DotBadge variant="success" pulse />

// Counter badge (notifications)
<CounterBadge count={23} variant="danger" />
```

**Badge Props:**
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `rounded`: boolean
- `icon`: ReactNode

---

### Card

Container component with optional header and footer.

```tsx
import { Card, StatCard } from '@/components/ui'
import { TrendingUp as TrendIcon } from '@mui/icons-material'

// Basic card
<Card
  title="User Settings"
  subtitle="Manage your account preferences"
  headerAction={<Button size="sm">Edit</Button>}
  footer={<Button fullWidth>Save Changes</Button>}
  hoverable
>
  <p>Card content goes here...</p>
</Card>

// Stat card (for metrics)
<StatCard
  label="Total Users"
  value="1,234"
  change={{ value: 12.5, type: 'increase' }}
  icon={<TrendIcon />}
/>
```

**Card Props:**
- `title`: string
- `subtitle`: string
- `headerAction`: ReactNode
- `footer`: ReactNode
- `variant`: 'default' | 'bordered' | 'elevated'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hoverable`: boolean
- `clickable`: boolean
- `onClick`: () => void

---

### LoadingState & Skeleton

Loading indicators and content placeholders.

```tsx
import { LoadingState, Skeleton, SkeletonGroup } from '@/components/ui'

// Loading spinner
<LoadingState
  size="md"
  message="Loading data..."
  fullScreen
/>

// Skeleton loader
<Skeleton variant="rectangular" width={200} height={100} />
<Skeleton variant="text" width="100%" />
<Skeleton variant="circular" width={40} height={40} />

// Multiple skeletons
<SkeletonGroup count={5} />
```

**LoadingState Props:**
- `size`: 'sm' | 'md' | 'lg'
- `message`: string
- `fullScreen`: boolean

---

### EmptyState

Beautiful empty state screens.

```tsx
import { EmptyState } from '@/components/ui'
import { Inbox as InboxIcon, Add as AddIcon } from '@mui/icons-material'

<EmptyState
  icon={<InboxIcon />}
  title="No items found"
  description="Get started by creating your first item"
  action={{
    label: 'Create Item',
    onClick: handleCreate,
    icon: <AddIcon />
  }}
/>
```

**Props:**
- `icon`: ReactNode
- `title`: string
- `description`: string
- `action`: { label: string, onClick: () => void, icon?: ReactNode }

---

## Animations

The library includes smooth, professional animations:

- `animate-fadeIn` / `animate-fadeOut`
- `animate-scaleIn` / `animate-scaleOut`
- `animate-slideDown` / `animate-slideUp`
- `animate-slideInRight` / `animate-slideInLeft`

All animations use `200ms cubic-bezier(0.4, 0, 0.2, 1)` for smooth, natural motion.

---

## Color Palette

### Neutral Colors
- Background: White, Gray-50, Gray-100
- Text: Gray-900, Gray-600, Gray-400
- Borders: Gray-200, Gray-300

### Accent Colors
- Primary: #10A37F (ChatGPT Green)
- Success: Green-500
- Warning: Yellow-500
- Danger: Red-500
- Info: Blue-500

---

## Accessibility

All components include:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance (WCAG AA)

---

## Best Practices

1. **Use semantic variants**: Choose button/badge variants that match their purpose
2. **Provide labels**: Always include `aria-label` for icon-only buttons
3. **Show loading states**: Use the `loading` prop when performing async operations
4. **Validate inputs**: Display error messages with the `error` prop
5. **Handle keyboard navigation**: All interactive components support keyboard input
6. **Mobile-first**: Components are responsive by default, test on mobile devices

---

## Examples

### Form with Validation

```tsx
import { Input, Button, Toast } from '@/components/ui'

function ContactForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await submitForm({ email, message })
      setShowToast(true)
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          fullWidth
        />

        <TextArea
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          error={errors.message}
          rows={4}
          fullWidth
        />

        <Button type="submit" loading={loading} fullWidth>
          Send Message
        </Button>
      </form>

      {showToast && (
        <Toast
          type="success"
          message="Message sent successfully"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  )
}
```

---

## Support

For issues or feature requests, please refer to the project documentation or create an issue in the repository.

---

**Version**: 1.0.0
**Last Updated**: November 8, 2025
**License**: MIT
