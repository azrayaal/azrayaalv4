<script setup lang="ts">
/**
 * Icons are referenced by name from the data layer. The registry keeps the
 * bundle to the icons actually used — add a name here before using it in data.
 */
import { computed } from 'vue';
import {
  Atom, AtSign, BadgeInfo, BarChart3, Bell, Blocks, BookOpen, Box, Braces, Briefcase, Check,
  ChevronRight, Clock, Cloud, CloudCog, CloudLightning, Code2, Component, Container, Cpu, Database,
  Download, ExternalLink, FileCode2, FileText, FlaskConical, Gamepad2, Gauge, GitBranch, GitMerge,
  Github, Globe, GraduationCap, Hexagon, Image, Info, Keyboard, Layers, LayoutGrid, Linkedin, Lock,
  LogOut, Mail, MapPin, MessageCircle, MessageSquare, Moon, MousePointerClick, Network, Palette,
  PenTool, Power, Radio, Rocket, RotateCcw, Send, Settings, Share2, Ship, Smartphone, Sparkles,
  Table2, Triangle, Trophy, UserRound, Users, Volume2, Waves, Wind, Zap,
} from 'lucide-vue-next';

const registry = {
  Atom, AtSign, BadgeInfo, BarChart3, Bell, Blocks, BookOpen, Box, Braces, Briefcase, Check,
  ChevronRight, Clock, Cloud, CloudCog, CloudLightning, Code2, Component, Container, Cpu, Database,
  Download, ExternalLink, FileCode2, FileText, FlaskConical, Gamepad2, Gauge, GitBranch, GitMerge,
  Github, Globe, GraduationCap, Hexagon, Image, Info, Keyboard, Layers, LayoutGrid, Linkedin, Lock,
  LogOut, Mail, MapPin, MessageCircle, MessageSquare, Moon, MousePointerClick, Network, Palette,
  PenTool, Power, Radio, Rocket, RotateCcw, Send, Settings, Share2, Ship, Smartphone, Sparkles,
  Table2, Triangle, Trophy, UserRound, Users, Volume2, Waves, Wind, Zap,
} as const;

const props = withDefaults(defineProps<{ name: string; size?: number; stroke?: number }>(), {
  size: 24,
  stroke: 1.6,
});

const component = computed(() => registry[props.name as keyof typeof registry] ?? Box);
</script>

<template>
  <component :is="component" :size="size" :stroke-width="stroke" aria-hidden="true" />
</template>
