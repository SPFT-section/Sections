import React from 'react';
import * as LucideIcons from 'lucide-react';

const iconMap = {
  home: LucideIcons.Home,
  library: LucideIcons.Library,
  book: LucideIcons.BookOpen,
  history: LucideIcons.History,
  user: LucideIcons.User,
  userCircle: LucideIcons.UserCircle,
  sun: LucideIcons.Sun,
  moon: LucideIcons.Moon,
  plus: LucideIcons.Plus,
  plusCircle: LucideIcons.PlusCircle,
  pencil: LucideIcons.Pencil,
  edit: LucideIcons.Edit,
  edit2: LucideIcons.Edit2,
  pen: LucideIcons.Pen,
  penBox: LucideIcons.PenBox,
  penSquare: LucideIcons.PenSquare,
  trash: LucideIcons.Trash2,
  delete: LucideIcons.X,
  read: LucideIcons.BookOpen,
  eye: LucideIcons.Eye,
  arrowRight: LucideIcons.ArrowRight,
  arrowLeft: LucideIcons.ArrowLeft,
  rotateCw: LucideIcons.RotateCw,
  save: LucideIcons.Save,
  check: LucideIcons.Check,
  checkCircle: LucideIcons.CheckCircle,
  settings: LucideIcons.Settings,
  sliders: LucideIcons.Sliders,
  search: LucideIcons.Search,
  filter: LucideIcons.Filter,
  close: LucideIcons.X,
  menu: LucideIcons.Menu,
  alignJustify: LucideIcons.AlignJustify,
  alignLeft: LucideIcons.AlignLeft,
  barChart: LucideIcons.BarChart,
  download: LucideIcons.Download,
  upload: LucideIcons.Upload,
  type: LucideIcons.Type,
  maximize: LucideIcons.Maximize,
  expand: LucideIcons.Expand,
  bookOpen: LucideIcons.BookOpen,
  fileText: LucideIcons.FileText,
  file: LucideIcons.File,
  filePlus: LucideIcons.FilePlus,
  wrench: LucideIcons.Wrench,
  list: LucideIcons.List,
  play: LucideIcons.Play,
  bookmark: LucideIcons.Bookmark,
  cloud: LucideIcons.Cloud,
  clock: LucideIcons.Clock,
  calendar: LucideIcons.Calendar,
  grid: LucideIcons.Grid,
  layout: LucideIcons.Layout,
  layers: LucideIcons.Layers,
  copy: LucideIcons.Copy,
  monitor: LucideIcons.Monitor,
  smartphone: LucideIcons.Smartphone,
  alertCircle: LucideIcons.AlertCircle,
  xCircle: LucideIcons.XCircle,
  info: LucideIcons.Info,
  // เพิ่มไอคอนที่ใช้ในหน้า NovelReader
  toc: LucideIcons.List,
  'table-of-contents': LucideIcons.List,
};

export const Icon = ({
  name,
  size = 20,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  ...props
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
};

export const CustomIcon = ({ src, alt = '', className = '', ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`custom-icon ${className}`}
      {...props}
    />
  );
};

export default Icon;
