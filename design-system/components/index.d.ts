// Favolist components — documentation types. The bundle is framework-free: each factory returns a DOM element
// styled by bundle.css and tokens.css. The Next.js rebuild mirrors these props as React component props.

export type IconName = 'home' | 'search' | 'plus-square' | 'bookmark' | 'bell' | 'user' | 'heart' | 'message-circle' | 'share' | 'copy' | 'external-link' | 'image' | 'plus' | 'check' | 'x' | 'x-circle' | 'check-circle' | 'chevron-left' | 'chevron-right' | 'chevron-down' | 'alert-triangle' | 'info' | 'more-horizontal' | 'upload' | 'grip-horizontal' | 'pencil' | 'trash-2' | 'link' | 'mail' | 'list' | 'mic' | 'square' | 'wand' | 'undo' | 'youtube' | 'instagram' | 'globe';

export interface ButtonProps {
  /** Sentence case, verb first. */
  label?: string;
  /** primary: one per view. secondary: pink follow-up (Follow). tertiary (default): neutral. link: text only. danger: inside a confirmation. */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link' | 'danger';
  /** sm = 32px (label-sm), default = 40px (label), lg = 48px (label-lg). */
  size?: 'sm' | 'md' | 'lg';
  /** Leading Lucide icon, 20px (16px in sm). */
  icon?: IconName;
  /** Renders an <a> instead of a <button>. */
  href?: string;
  /** Required on icon-only buttons. */
  ariaLabel?: string;
  /** Whole element at opacity-disabled; change the label too ("Saving…"). */
  disabled?: boolean;
  block?: boolean;
  type?: 'button' | 'submit';
  onClick?: (e: MouseEvent) => void;
}
export declare function Button(props: ButtonProps): HTMLButtonElement | HTMLAnchorElement;

export interface FollowButtonProps { following?: boolean; size?: 'sm' | 'md' | 'lg'; onToggle?: (following: boolean) => void }
/** Follow that morphs into Following in place: the fill drains to accent-soft, the label crossfades, the width never changes. */
export declare function FollowButton(props: FollowButtonProps): HTMLButtonElement;

export interface MarkLoaderProps { size?: 'sm' | 'md' | 'lg'; label?: string }
/** The mark assembling: three squares slide in, the fourth splits into four and the bottom pair flush pink. The splash and the page loader. */
export declare function MarkLoader(props: MarkLoaderProps): HTMLDivElement;

export interface AvatarProps {
  /** The creator's name — alt text, and the source of initials and tone when there is no image. */
  name: string;
  src?: string;
  size?: 24 | 32 | 40 | 48 | 56 | 72 | 144;
  /** shadow-sm and a surface-coloured ring; for the 144px profile avatar over a cover. */
  bordered?: boolean;
}
export declare function Avatar(props: AvatarProps): HTMLElement;

export interface TabItem { id: string; label: string; count?: number }
export interface TabsProps {
  items: TabItem[];
  selected: string;
  onChange?: (id: string) => void;
}
export declare function Tabs(props: TabsProps): HTMLDivElement;

export interface ProductCardProps {
  creator: { name: string; avatar?: string };
  listName?: string;
  product: { name: string; image?: string; brand?: string; brandLogo?: string; url?: string };
  /** The creator's own words. Mandatory: a product without a review is not shown. Clamped to 3 lines here, full on the product page. */
  review: string;
  code?: string;
  /** e.g. "10% off with". */
  codeLabel?: string;
  likes?: number;
  comments?: number;
}
export declare function ProductCard(props: ProductCardProps): HTMLElement;

export interface ListCardProps {
  name: string;
  /** "12 products" */
  count: string;
  cover?: string;
  creator: { name: string; avatar?: string; followers?: string };
  href?: string;
  /** sm for 2-column mobile grids and the suggestions rail. */
  size?: 'md' | 'sm';
}
export declare function ListCard(props: ListCardProps): HTMLAnchorElement;

export interface SideNavItem { label: string; icon: IconName; href?: string; current?: boolean }
export interface SideNavProps {
  items: SideNavItem[];
  /** URL of favolist-mark.svg (or -light in the dark theme). */
  mark?: string;
  homeHref?: string;
  user?: { name: string; handle?: string; avatar?: string };
}
export declare function SideNav(props: SideNavProps): HTMLElement;

export type Tone = 'success' | 'warning' | 'danger';

export interface BadgeProps { label: string; tone?: 'accent' | Tone; icon?: IconName }
export declare function Badge(props: BadgeProps): HTMLSpanElement;

export interface BrandChipProps { name: string; /** 20px-tall logo; the name in overline when absent. */ logo?: string }
export declare function BrandChip(props: BrandChipProps): HTMLSpanElement;

export interface CodeFrameProps { code: string; /** e.g. "10% off with" */ label?: string; onCopy?: (code: string) => void }
export declare function CodeFrame(props: CodeFrameProps): HTMLDivElement;

export interface UserCardProps { name: string; handle?: string; /** "2.4k followers" */ meta?: string; avatar?: string; size?: 40 | 48; following?: boolean; /** false hides the Follow button (your own card). */ action?: boolean; lined?: boolean; onFollow?: () => void }
export declare function UserCard(props: UserCardProps): HTMLDivElement;

export interface ProfileHeaderProps { name: string; handle?: string; avatar?: string; bio?: string; /** Up to four, in the creator's order; icon is a Lucide name (youtube, instagram, globe, link). */ links?: { href: string; label?: string; icon?: IconName }[]; /** One link; kept for compatibility. */ link?: { href: string; label?: string; icon?: IconName }; counts?: { value: string; label: string }[]; /** 144px avatar and display type (desktop). */ large?: boolean; /** Your own profile: Edit instead of Follow. */ own?: boolean; following?: boolean; onFollow?: () => void; onEdit?: () => void; onShare?: () => void }
export declare function ProfileHeader(props: ProfileHeaderProps): HTMLElement;

export interface TopBarAction { icon: IconName; label: string; onClick?: () => void; /** accent dot (unread). */ badge?: boolean }
export interface TopBarProps { /** Brand form: mark + wordmark instead of back + title. */ brand?: boolean; mark?: string; homeHref?: string; title?: string; backLabel?: string; onBack?: () => void; action?: TopBarAction }
export declare function TopBar(props: TopBarProps): HTMLElement;

export interface BottomBarItem { icon: IconName; label: string; href?: string; current?: boolean; unread?: boolean }
export declare function BottomBar(props: { items: BottomBarItem[] }): HTMLElement;

export interface AsideRailProps { user?: { name: string; handle?: string; avatar?: string }; lists?: ListCardProps[]; people?: UserCardProps[]; onSeeAll?: () => void }
export declare function AsideRail(props: AsideRailProps): HTMLElement;

export interface SearchFieldProps { placeholder?: string; value?: string; size?: 'md' | 'lg'; onChange?: (value: string) => void }
export declare function SearchField(props: SearchFieldProps): HTMLDivElement;

export interface FieldProps { id?: string; label?: string; optional?: boolean; help?: string; /** Replaces help; turns the field red. */ error?: string; maxLength?: number; disabled?: boolean }
export interface TextFieldProps extends FieldProps { type?: 'text' | 'email' | 'url' | 'number'; value?: string; placeholder?: string; autocomplete?: string }
export declare function TextField(props: TextFieldProps): HTMLDivElement;
export interface TextAreaProps extends FieldProps { value?: string; placeholder?: string; rows?: number; /** Adds the Speak button; the review field always sets it. */ voice?: boolean; /** Shows the Listening bar and turns Speak into Stop. */ recording?: boolean; /** "0:14" */ recordingTime?: string; /** Shows the "Tidied from your recording" badge and the revert link. */ tidied?: boolean; onRecord?: (recording: boolean) => void; onRevert?: () => void }
export declare function TextArea(props: TextAreaProps): HTMLDivElement;
export interface SelectProps extends FieldProps { options: { value: string; label: string }[]; value?: string; onChange?: (value: string) => void }
export declare function Select(props: SelectProps): HTMLDivElement;
export interface ChoiceProps { label: string; help?: string; checked?: boolean; disabled?: boolean; onChange?: (checked: boolean) => void }
export declare function Checkbox(props: ChoiceProps): HTMLLabelElement;
export declare function Toggle(props: ChoiceProps): HTMLLabelElement;

export interface ImageUploaderProps { src?: string; label?: string; hint?: string; /** 16:9 for list covers on desktop. */ wide?: boolean; onPick?: () => void; onRemove?: () => void }
export declare function ImageUploader(props: ImageUploaderProps): HTMLElement;

export interface ReferralCardProps { product: { name: string; image?: string }; listName?: string; code?: string; codeLabel?: string; sortable?: boolean; onEdit?: () => void }
export declare function ReferralCard(props: ReferralCardProps): HTMLDivElement;

export interface NotificationRowProps { actor: { name: string; avatar?: string }; /** "started following you." */ message: string; time: string; read?: boolean; href?: string }
export declare function NotificationRow(props: NotificationRowProps): HTMLAnchorElement;

export interface DialogProps { title: string; body?: string | HTMLElement; actions?: ButtonProps[]; onClose?: () => void; /** role=alertdialog for destructive confirmations. */ alert?: boolean }
export declare function Dialog(props: DialogProps): HTMLDivElement;
export declare function Sheet(props: DialogProps): HTMLDivElement;

export interface AlertProps { tone?: Tone; title?: string; message: string; dismissible?: boolean; onDismiss?: () => void }
export declare function Alert(props: AlertProps): HTMLDivElement;
export interface ToastProps { tone?: 'success' | 'danger'; message: string; action?: { label: string; onClick?: () => void }; /** ms; 0 keeps it. Default 4000. */ duration?: number }
export declare function Toast(props: ToastProps): HTMLDivElement;
export interface EmptyStateProps { icon?: IconName; title: string; message?: string; action?: ButtonProps }
export declare function EmptyState(props: EmptyStateProps): HTMLDivElement;
export interface SkeletonProps { width?: number | string; height?: number | string; text?: boolean; round?: boolean }
export declare function Skeleton(props: SkeletonProps): HTMLDivElement;
export declare function LoadMore(props: { label?: string }): HTMLDivElement;

declare global {
  interface Window {
    Favolist: {
      Button: typeof Button; FollowButton: typeof FollowButton; MarkLoader: typeof MarkLoader; Avatar: typeof Avatar; Badge: typeof Badge; BrandChip: typeof BrandChip; CodeFrame: typeof CodeFrame; UserCard: typeof UserCard; ProfileHeader: typeof ProfileHeader;
      Tabs: typeof Tabs; TopBar: typeof TopBar; BottomBar: typeof BottomBar; SideNav: typeof SideNav; AsideRail: typeof AsideRail; SearchField: typeof SearchField;
      TextField: typeof TextField; TextArea: typeof TextArea; Select: typeof Select; Checkbox: typeof Checkbox; Toggle: typeof Toggle; ImageUploader: typeof ImageUploader;
      ProductCard: typeof ProductCard; ListCard: typeof ListCard; ReferralCard: typeof ReferralCard; NotificationRow: typeof NotificationRow;
      Dialog: typeof Dialog; Sheet: typeof Sheet; Alert: typeof Alert; Toast: typeof Toast; EmptyState: typeof EmptyState; Skeleton: typeof Skeleton; LoadMore: typeof LoadMore;
      icon: (name: IconName, size?: 'sm' | 'lg') => SVGElement;
    };
  }
}
