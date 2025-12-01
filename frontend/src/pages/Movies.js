import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Chart from 'chart.js/auto';
import './Wrestling.css';

// --- Helper Data and Functions ---

// Schedule for weekly shows in US Eastern Time
const showSchedule = [
    { name: 'WWE Raw', day: 1, endHourET: 23, endMinuteET: 0 }, // Monday 11:00 PM ET
    { name: 'WWE NXT', day: 2, endHourET: 22, endMinuteET: 0 }, // Tuesday 10:00 PM ET
    { name: 'AEW Dynamite', day: 3, endHourET: 22, endMinuteET: 0 }, // Wednesday 10:00 PM ET
    { name: 'WWE SmackDown', day: 5, endHourET: 22, endMinuteET: 0 }, // Friday 10:00 PM ET
    { name: 'AEW Collision', day: 6, endHourET: 22, endMinuteET: 0 }, // Saturday 10:00 PM ET
];

// Helper to get the current time zone offset for US Eastern Time (approximates EDT/EST)
const getETOffset = (date = new Date()) => {
    const year = date.getFullYear();
    const march = new Date(year, 2, 8); // 2nd Sunday in March
    march.setDate(march.getDate() + (7 - march.getDay()));
    const november = new Date(year, 10, 1); // 1st Sunday in November
    november.setDate(november.getDate() + (7 - november.getDay()));
    return (date >= march && date < november) ? -4 : -5; // EDT is UTC-4, EST is UTC-5
};

// --- React Component ---

export default function Movies() {
    const navigate = useNavigate(); // Hook for navigation
    const [data, setData] = useState(null);
    const [lastUpdate, setLastUpdate] = useState('Never');
    const [refreshing, setRefreshing] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [nextRefresh, setNextRefresh] = useState(null);
    const [insights, setInsights] = useState([
        'Nielsen Methodology Change (Oct 2024): The "Big Data + Panel" system shows 14-20% lower ratings for all wrestling programs due to more accurate tracking of viewer tune-outs.',
        'AEW Viewership Crisis: Dynamite down 39% YoY, with key demo declining 60% since Oct 2024. Lowest recorded viewership in standard timeslot.',
        'WWE Dominance: Raw averages 3.5x Dynamite\'s viewership. SmackDown move to USA Network caused 39% drop but stabilized.',
    ]);

    const chartRefs = useRef({});
    const schedulerTimeoutId = useRef(null);

    // --- Data Simulation and Insights ---

    const generateInsight = (showName, oldViewers, newViewers) => {
        const change = (newViewers - oldViewers) / oldViewers;
        if (Math.abs(change) < 0.01) {
            return `${showName} ratings stable this week.`;
        }
        const direction = change > 0 ? 'up' : 'down';
        const adjective = Math.abs(change) > 0.05 ? 'significantly' : 'slightly';
        return `${showName} viewership is ${adjective} ${direction} (${(change * 100).toFixed(1)}%) this week.`;
    };

    const autoRefresh = useCallback((showsToUpdate) => {
        console.log(`🤖 Auto-refresh triggered for: ${showsToUpdate.join(', ')}`);
        setData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData)); // Deep copy
            const newInsights = [];

            showsToUpdate.forEach(showName => {
                const showIndex = newData.shows.findIndex(s => s.name === showName);
                if (showIndex !== -1) {
                    const show = newData.shows[showIndex];
                    const oldViewers = show.viewers;

                    // Simulate new data
                    show.viewers += (Math.random() - 0.5) * 0.05 * show.viewers;
                    show.keyDemo += (Math.random() - 0.5) * 0.01;
                    show.trend.push(show.viewers);
                    if (show.trend.length > 7) show.trend.shift();
                    
                    newInsights.push(generateInsight(show.name, oldViewers, show.viewers));
                }
            });
            
            setInsights(prev => [...prev, ...newInsights].slice(-5)); // Keep last 5 insights
            return newData;
        });

        setLastUpdate(new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' }));
        setAlert({ show: true, type: 'success', message: `✅ Auto-sync: ${showsToUpdate.join(' & ')} ratings updated.` });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
    }, []);

    // --- Scheduler Logic ---

    useEffect(() => {
        const scheduleNextRefresh = () => {
            const now = new Date();
            const etOffset = getETOffset(now);
            const nowUTC = now.getTime();

            let nextRefreshTime = Infinity;
            let showsToRefreshAtNext = [];

            showSchedule.forEach(show => {
                const showEndTimeUTC = new Date();
                const localDay = showEndTimeUTC.getDay();
                const localHours = showEndTimeUTC.getHours();
                
                let daysUntil = show.day - localDay;
                if (daysUntil < 0 || (daysUntil === 0 && localHours >= show.endHourET - etOffset)) {
                    daysUntil += 7;
                }

                showEndTimeUTC.setDate(showEndTimeUTC.getDate() + daysUntil);
                showEndTimeUTC.setHours(show.endHourET - etOffset, show.endMinuteET + 30, 0, 0);

                if (showEndTimeUTC.getTime() < nextRefreshTime) {
                    nextRefreshTime = showEndTimeUTC.getTime();
                    showsToRefreshAtNext = [show.name];
                } else if (showEndTimeUTC.getTime() === nextRefreshTime) {
                    showsToRefreshAtNext.push(show.name);
                }
            });

            if (isFinite(nextRefreshTime)) {
                setNextRefresh(new Date(nextRefreshTime));
                const msUntilNextRefresh = nextRefreshTime - nowUTC;
                
                console.log(`🕒 Next auto-refresh scheduled for ${new Date(nextRefreshTime).toLocaleString()} (${showsToRefreshAtNext.join(', ')})`);

                schedulerTimeoutId.current = setTimeout(() => {
                    autoRefresh(showsToRefreshAtNext);
                    scheduleNextRefresh();
                }, msUntilNextRefresh);
            }
        };

        if (data) {
            scheduleNextRefresh();
        }

        return () => {
            if (schedulerTimeoutId.current) {
                clearTimeout(schedulerTimeoutId.current);
            }
        };
    }, [data, autoRefresh]);


    // --- Manual Refresh and Initial Load ---

    useEffect(() => {
        const initialData = {
            shows: [
                { name: 'WWE Raw', network: 'Netflix', promotion: 'WWE', viewers: 1.85, keyDemo: 0.52, trend: [1.65, 1.72, 1.58, 1.68, 1.70, 1.85, 1.82], changeYoY: '+12%', lastEpisode: 'Nov 24, 2025' },
                { name: 'WWE SmackDown', network: 'USA', promotion: 'WWE', viewers: 1.21, keyDemo: 0.27, trend: [1.15, 1.18, 1.12, 1.19, 1.20, 1.21, 1.23], changeYoY: '-8%', lastEpisode: 'Nov 21, 2025' },
                { name: 'WWE NXT', network: 'CW', promotion: 'WWE', viewers: 0.68, keyDemo: 0.18, trend: [0.62, 0.64, 0.60, 0.66, 0.68, 0.68, 0.70], changeYoY: '-5%', lastEpisode: 'Nov 18, 2025' },
                { name: 'AEW Dynamite', network: 'TBS', promotion: 'AEW', viewers: 0.531, keyDemo: 0.12, trend: [0.650, 0.640, 0.580, 0.520, 0.450, 0.531, 0.498], changeYoY: '-39%', lastEpisode: 'Nov 19, 2025' },
                { name: 'AEW Collision', network: 'TBS', promotion: 'AEW', viewers: 0.378, keyDemo: 0.09, trend: [0.420, 0.410, 0.380, 0.350, 0.340, 0.378, 0.365], changeYoY: '-42%', lastEpisode: 'Nov 19, 2025' }
            ]
        };
        setData(initialData);
        setLastUpdate(new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    }, []);

    useEffect(() => {
        if (!data) return;
        Object.values(chartRefs.current).forEach(chart => { if(chart) chart.destroy() });
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        chartRefs.current.trend = new Chart(trendCtx, { type: 'line', data: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7'], datasets: [ { label: 'WWE Flagship (Raw)', data: data.shows.find(s => s.name === 'WWE Raw').trend, borderColor: '#FFC200', backgroundColor: 'rgba(255, 194, 0, 0.1)', borderWidth: 3, tension: 0.4, fill: true }, { label: 'AEW Flagship (Dynamite)', data: data.shows.find(s => s.name === 'AEW Dynamite').trend, borderColor: '#000', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderWidth: 3, tension: 0.4, fill: true } ] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'Viewers (Millions)' } } } } });
        const demoCtx = document.getElementById('demoChart').getContext('2d');
        chartRefs.current.demo = new Chart(demoCtx, { type: 'bar', data: { labels: data.shows.map(s => s.name), datasets: [{ label: 'Key Demo Rating (18-49)', data: data.shows.map(s => s.keyDemo), backgroundColor: data.shows.map(s => s.promotion === 'WWE' ? '#FFC200' : '#000') }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 0.6 } } } });
    }, [data]);

    const handleManualRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setData(prevData => {
                const newData = JSON.parse(JSON.stringify(prevData));
                newData.shows.forEach(show => {
                    show.viewers += (Math.random() - 0.5) * 0.05 * show.viewers;
                    show.keyDemo += (Math.random() - 0.5) * 0.01;
                    show.trend.push(show.viewers);
                    if (show.trend.length > 7) show.trend.shift();
                });
                return newData;
            });
            setLastUpdate(new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' }));
            setRefreshing(false);
            setAlert({ show: true, type: 'success', message: `✅ Manual sync complete! All shows updated.` });
            setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
        }, 1500);
    };

    const rawData = data?.shows.find(s => s.name === 'WWE Raw');
    const dynamiteData = data?.shows.find(s => s.name === 'AEW Dynamite');

    return (
        <div style={{position: 'relative'}}>
            <button 
              onClick={() => navigate(-1)} 
              className="back-button"
            >
              ← Back
            </button>
            <div className="container" style={{background: 'var(--color-bg)', padding: 'var(--space-20)'}}>
                <header>
                    <h1>🎭 Wrestling Viewership Dashboard</h1>
                    <p className="subtitle">AEW vs WWE - 2025 Ratings & Demographics</p>
                </header>

                <div className="controls">
                    <div className="control-group">
                        <label htmlFor="metric">Select Metric:</label>
                        <select id="metric">
                            <option value="viewership">Total Viewership</option>
                            <option value="keyDemo">Key Demo (18-49)</option>
                            <option value="trend">Weekly Trend</option>
                        </select>
                    </div>
                    <div className="control-group">
                        <label htmlFor="program">Select Program:</label>
                        <select id="program">
                            <option value="all">All Shows</option>
                            <option value="flagship">Flagship Only</option>
                        </select>
                    </div>
                    <div className="control-group">
                        <button className={`btn btn-refresh ${refreshing ? 'loading' : ''}`} id="manualRefresh" onClick={handleManualRefresh} disabled={refreshing}>
                            {refreshing ? '⏳ Updating...' : '🔄 Update Now'}
                        </button>
                    </div>
                    <div className="status-indicator">
                        <span>Last Updated: {lastUpdate}</span>
                        <span className={`status-dot ${refreshing ? 'active' : ''}`}></span>
                    </div>
                     <div className="status-indicator">
                        <span>Next Auto-Refresh: {nextRefresh ? nextRefresh.toLocaleString() : 'Calculating...'}</span>
                    </div>
                </div>
                
                {alert.show && <div className={`alert alert-${alert.type}`} style={{display: 'flex'}}><span id="alertText">{alert.message}</span></div>}

                <div className="comparison">
                    <div className="card">
                        <h3><span className="badge badge-wwe">WWE</span> Raw</h3>
                        <div className="metric">
                            <div className="metric-label">Avg Viewership (Nov 2025)</div>
                            <div className="metric-value">{rawData ? `${rawData.viewers.toFixed(2)}M` : 'N/A'}</div>
                            <div className="change positive">↑ 12% YoY</div>
                        </div>
                        <div className="metric" style={{ marginTop: '12px' }}>
                            <div className="metric-label">Key Demo (18-49)</div>
                            <div className="metric-value">{rawData ? rawData.keyDemo.toFixed(2) : 'N/A'}</div>
                        </div>
                    </div>

                    <div className="card">
                        <h3><span className="badge badge-aew">AEW</span> Dynamite</h3>
                        <div className="metric">
                            <div className="metric-label">Avg Viewership (Nov 2025)</div>
                            <div className="metric-value">{dynamiteData ? `${(dynamiteData.viewers * 1000).toFixed(0)}K` : 'N/A'}</div>
                            <div className="change negative">↓ 39% YoY</div>
                        </div>
                        <div className="metric" style={{ marginTop: '12px' }}>
                            <div className="metric-label">Key Demo (18-49)</div>
                            <div className="metric-value">{dynamiteData ? dynamiteData.keyDemo.toFixed(2) : 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div className="grid">
                    <div className="card">
                        <h3>📊 Viewership Trend (Last 7 Weeks)</h3>
                        <canvas id="trendChart"></canvas>
                    </div>
                    <div className="card">
                        <h3>🎯 Key Demo Ratings</h3>
                        <canvas id="demoChart"></canvas>
                    </div>
                </div>
                
                <div className="grid">
                    <div className="card">
                        <h3>📺 All Shows Comparison (Nov 2025)</h3>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Show</th>
                                    <th>Viewers</th>
                                    <th>Key Demo</th>
                                    <th>Network</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.shows.map(show => (
                                    <tr key={show.name}>
                                        <td><strong>{show.name}</strong></td>
                                        <td>{show.viewers.toFixed(3)}M</td>
                                        <td>{show.keyDemo.toFixed(2)}</td>
                                        <td>{show.network}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card">
                        <h3>📈 AI-Generated Insights</h3>
                        <div style={{display: 'grid', gap: '12px'}}>
                            {insights.map((insight, index) => (
                                 <div key={index} style={{padding: '12px', background: 'var(--color-bg)', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--color-primary)'}}>
                                    {insight}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}