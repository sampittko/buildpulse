import React from 'react';
import { ProjectHealth } from '../lib/types';
import { formatHours } from '../lib/utils';

interface ProjectPulseProps {
  health: ProjectHealth;
}

export default function ProjectPulse({ health }: ProjectPulseProps) {
  const { project, weeklyHours, targetHours, commits, healthScore, status } = health;

  // Define colors and animations based on health status
  const statusConfig = {
    excellent: {
      color: 'bg-green-400',
      glow: 'shadow-green-400/50',
      animation: 'animate-pulse',
      icon: '💚',
      text: 'Excellent'
    },
    good: {
      color: 'bg-blue-400',
      glow: 'shadow-blue-400/50',
      animation: 'animate-pulse',
      icon: '💙',
      text: 'Good'
    },
    warning: {
      color: 'bg-yellow-400',
      glow: 'shadow-yellow-400/50',
      animation: 'animate-pulse',
      icon: '💛',
      text: 'Warning'
    },
    critical: {
      color: 'bg-red-400',
      glow: 'shadow-red-400/50',
      animation: 'animate-ping',
      icon: '❤️‍🩹',
      text: 'Critical'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  const progressPercentage = Math.min((weeklyHours / targetHours) * 100, 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Project Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {project.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Pulse Light */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div
            className={`w-20 h-20 rounded-full ${config.color} ${config.animation} shadow-2xl ${config.glow}`}
            style={{
              boxShadow: `0 0 30px ${config.color.includes('green') ? '#4ade80' :
                config.color.includes('blue') ? '#60a5fa' :
                  config.color.includes('yellow') ? '#facc15' : '#f87171'}`
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            {config.icon}
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {healthScore}%
        </div>
        <div className={`text-sm font-medium ${status === 'excellent' ? 'text-green-600 dark:text-green-400' :
          status === 'good' ? 'text-blue-600 dark:text-blue-400' :
            status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
          }`}>
          {config.text}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Hours this week</span>
          <span>{formatHours(weeklyHours)} / {formatHours(targetHours)}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${config.color}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {commits}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Commits
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatHours(weeklyHours)}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Tracked
          </div>
        </div>
      </div>

      {/* Project Link */}
      {project.url && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            View Project →
          </a>
        </div>
      )}
    </div>
  );
} 