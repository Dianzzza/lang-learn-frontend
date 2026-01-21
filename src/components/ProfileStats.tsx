// src/components/ProfileStats.tsx 

import React from 'react';
import { useRouter } from 'next/router';

interface ProfileStatsProps {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  todayLessons: number;
  dailyGoal: number;
}

export default function ProfileStats({
  totalPoints,
  currentStreak,
  longestStreak,
  todayLessons,
  dailyGoal,
}: ProfileStatsProps) {
  const router = useRouter();
  const safeDailyGoal = Math.max(dailyGoal || 1, 1);
  const goalProgress = Math.min((todayLessons / safeDailyGoal) * 100, 100);

  return (
    <div>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📊 Twoje Statystyki
      </h2>

      {/* STATS GRID - 2x2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* PUNKTY */}
        <div style={{
          padding: '20px',
          background: '#eef2ff',
          borderRadius: '12px',
          border: '1px solid #c7d2fe'
        }}>
          <div style={{
            fontSize: '24px',
            marginBottom: '8px'
          }}>💎</div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '4px'
          }}>
            {totalPoints.toLocaleString()}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Punkty
          </div>
        </div>

        {/* DNI Z RZĘDU */}
        <div style={{
          padding: '20px',
          background: '#fef3c7',
          borderRadius: '12px',
          border: '1px solid #fcd34d'
        }}>
          <div style={{
            fontSize: '24px',
            marginBottom: '8px'
          }}>🔥</div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '4px'
          }}>
            {currentStreak}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '8px'
          }}>
            Dni z rzędu
          </div>
          <div style={{
            fontSize: '11px',
            color: '#9ca3af'
          }}>
            Rekord: {longestStreak} dni
          </div>
        </div>

        {/* CEL DZIENNY */}
        <div style={{
          padding: '20px',
          background: '#d1fae5',
          borderRadius: '12px',
          border: '1px solid #86efac'
        }}>
          <div style={{
            fontSize: '24px',
            marginBottom: '8px'
          }}>🎯</div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '4px'
          }}>
            {todayLessons}/{safeDailyGoal}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '8px'
          }}>
            Dzisiejszy cel
          </div>
          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#a7f3d0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#10b981',
              width: `${Math.min(goalProgress, 100)}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* KONTYNUUJ NAUKĘ - BUTTON */}
        <div style={{
          padding: '20px',
          background: '#f0f9ff',
          borderRadius: '12px',
          border: '2px dashed #0ea5e9',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px'
          }}>📚</div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            lineHeight: '1.4'
          }}>
            Gotowy do nauki?
            <br />
            Kontynuuj tam gdzie skończyłeś
          </div>
          <button 
            onClick={() => router.push('/study')}
            style={{
              marginTop: '8px',
              padding: '10px 20px',
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0284c7';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0ea5e9';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Zacznij →
          </button>
        </div>
      </div>
    </div>
  );
}
