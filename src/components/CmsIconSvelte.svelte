<script lang="ts">
  import {
    Activity,
    AlertTriangle,
    Award,
    Banknote,
    Blocks,
    BookOpen,
    Briefcase,
    Building,
    Building2,
    Cable,
    Cctv,
    CheckCircle2,
    CheckSquare,
    CircleDollarSign,
    CircleHelp,
    ClipboardList,
    Clock,
    Cloud,
    Code,
    Cpu,
    Database,
    Factory,
    FileCheck,
    FileCode,
    FileSignature,
    Fingerprint,
    HardDrive,
    HardHat,
    Headset,
    HeartPulse,
    Info,
    Landmark,
    Laptop,
    Layout,
    Lock,
    MapPin,
    Maximize,
    Monitor,
    MonitorSmartphone,
    Network,
    Phone,
    Plug,
    Radio,
    RadioTower,
    RefreshCw,
    Route,
    Scale,
    Server,
    Shield,
    ShieldCheck,
    Signal,
    Smartphone,
    TrendingUp,
    UserCheck,
    UserPlus,
    UserSearch,
    Users,
    Wifi,
    Wrench,
    Zap,
  } from '@lucide/svelte';
  import type { Component } from 'svelte';

  const iconMap = {
    Activity,
    AlertTriangle,
    Award,
    Banknote,
    Blocks,
    BookOpen,
    Briefcase,
    Building,
    Building2,
    Cable,
    Cctv,
    CheckCircle2,
    CheckSquare,
    CircleDollarSign,
    ClipboardList,
    Clock,
    Cloud,
    Code,
    Cpu,
    Database,
    Factory,
    FileCheck,
    FileCode,
    FileSignature,
    Fingerprint,
    HardDrive,
    HardHat,
    Headset,
    HeartPulse,
    Info,
    Landmark,
    Laptop,
    Layout,
    Lock,
    MapPin,
    Maximize,
    Monitor,
    MonitorSmartphone,
    Network,
    Phone,
    Plug,
    Radio,
    RadioTower,
    RefreshCw,
    Route,
    Scale,
    Server,
    Shield,
    ShieldCheck,
    Signal,
    Smartphone,
    TrendingUp,
    UserCheck,
    UserPlus,
    UserSearch,
    Users,
    Wifi,
    Wrench,
    Zap,
  } satisfies Record<string, Component>;

  let {
    name,
    class: className = '',
    size = undefined,
    strokeWidth = undefined,
    ...rest
  }: {
    name?: string;
    class?: string;
    size?: number | string;
    strokeWidth?: number | string;
    [key: string]: unknown;
  } = $props();

  const normalizedName = $derived(name?.trim());
  const Icon = $derived(
    !normalizedName || normalizedName === 'None'
      ? null
      : normalizedName in iconMap
        ? iconMap[normalizedName as keyof typeof iconMap]
        : CircleHelp,
  );
</script>

{#if Icon}
  <Icon class={className} {size} {strokeWidth} {...rest} />
{/if}
