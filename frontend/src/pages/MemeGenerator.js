import React, { useState, useRef, useEffect } from 'react';

const MemeGenerator = () => {
    const [meme, setMeme] = useState({
        topText: '',
        bottomText: '',
        imageUrl: 'https://i.imgflip.com/1bij.jpg',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        fontSize: 40,
        strokeWidth: 2
    });
    const [activeTab, setActiveTab] = useState('trending');
    const [activeTemplate, setActiveTemplate] = useState('https://i.imgflip.com/1bij.jpg');
    const [status, setStatus] = useState({ message: '', type: '' });
    const [uploadedImage, setUploadedImage] = useState(null);
    const canvasRef = useRef(null);

    // All templates organized by category
    const templates = {
        trending: [
            { url: 'https://i.imgflip.com/1bij.jpg', name: 'Drake', icon: '🎤' },
            { url: 'https://i.imgflip.com/265l.jpg', name: 'Distracted', icon: '👀' },
            { url: 'https://i.imgflip.com/4t0m5.jpg', name: 'Woman Yelling', icon: '😤' },
            { url: 'https://i.imgflip.com/2hgfw.jpg', name: 'Brain Expand', icon: '🧠' },
            { url: 'https://i.imgflip.com/43s6f2.jpg', name: "Gru's Plan", icon: '📋' },
            { url: 'https://i.imgflip.com/7la82g.jpg', name: 'Bernie', icon: '🙏' }
        ],
        classic: [
            { url: 'https://i.imgflip.com/26jxvk.jpg', name: 'Success Kid', icon: '👶' },
            { url: 'https://i.imgflip.com/gk5el.jpg', name: 'Tom Cruise', icon: '😂' },
            { url: 'https://i.imgflip.com/3balcv.jpg', name: 'Bad Luck', icon: '😭' },
            { url: 'https://i.imgflip.com/5kr5y.jpg', name: 'One Does Not', icon: '🧙' },
            { url: 'https://i.imgflip.com/3xz5f1.jpg', name: 'Harold', icon: '😶' },
            { url: 'https://i.imgflip.com/5573ym.jpg', name: 'Grumpy Cat', icon: '😾' }
        ],
        comparison: [
            { url: 'https://i.imgflip.com/2wobuo.jpg', name: 'Drake Comp', icon: '✌️' },
            { url: 'https://i.imgflip.com/3qn77w.jpg', name: 'Doge Cheems', icon: '🐕' },
            { url: 'https://i.imgflip.com/430sgs.jpg', name: 'Virgin vs Chad', icon: '⚔️' },
            { url: 'https://i.imgflip.com/7la82g.jpg', name: 'Always Has Been', icon: '🔫' },
            { url: 'https://i.imgflip.com/1ur9b0.jpg', name: 'Left Exit', icon: '🛣️' },
            { url: 'https://i.imgflip.com/2zah21.jpg', name: 'UNO', icon: '🎴' }
        ],
        reaction: [
            { url: 'https://i.imgflip.com/2r1afz.jpg', name: 'Monkey', icon: '🐵' },
            { url: 'https://i.imgflip.com/2xzy6x.jpg', name: 'Blinking', icon: '😐' },
            { url: 'https://i.imgflip.com/1z715.jpg', name: 'Is This', icon: '🦋' },
            { url: 'https://i.imgflip.com/6snxqc.jpg', name: 'This Is Fine', icon: '🔥' },
            { url: 'https://i.imgflip.com/2r1afz.jpg', name: 'Shocked', icon: '😲' },
            { url: 'https://i.imgflip.com/1z715.jpg', name: 'Pikachu', icon: '⚡' }
        ]
    };

    const tabs = [
        { id: 'trending', label: '🔥 Trending', icon: '🔥' },
        { id: 'classic', label: '⭐ Classic', icon: '⭐' },
        { id: 'comparison', label: '🔄 Comparison', icon: '🔄' },
        { id: 'reaction', label: '😂 Reaction', icon: '😂' }
    ];

    const handleTemplateSelect = (template) => {
        setActiveTemplate(template.url);
        setMeme(prev => ({ ...prev, imageUrl: template.url }));
        setUploadedImage(null);
        setStatus({ message: `${template.name} selected!`, type: 'success' });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target.result);
                setMeme(prev => ({ ...prev, imageUrl: event.target.result }));
                setActiveTemplate(null);
                setStatus({ message: 'Image uploaded successfully!', type: 'success' });
            };
            reader.readAsDataURL(file);
        }
    };

    const updateMemeText = (field, value) => {
        setMeme(prev => ({ ...prev, [field]: value.toUpperCase() }));
    };

    const resetMeme = () => {
        setMeme({
            topText: '',
            bottomText: '',
            imageUrl: 'https://i.imgflip.com/1bij.jpg',
            textColor: '#FFFFFF',
            strokeColor: '#000000',
            fontSize: 40,
            strokeWidth: 2
        });
        setUploadedImage(null);
        setActiveTemplate('https://i.imgflip.com/1bij.jpg');
        setStatus({ message: 'Reset to default', type: 'success' });
    };

    const downloadMeme = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `meme-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setStatus({ message: 'Meme downloaded!', type: 'success' });
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || (!meme.imageUrl && !uploadedImage)) return;

        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            ctx.font = `bold ${meme.fontSize}px Impact, sans-serif`;
            ctx.fillStyle = meme.textColor;
            ctx.strokeStyle = meme.strokeColor;
            ctx.lineWidth = meme.strokeWidth;
            ctx.textAlign = 'center';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            const topY = meme.fontSize + 30;
            ctx.strokeText(meme.topText, canvas.width / 2, topY);
            ctx.fillText(meme.topText, canvas.width / 2, topY);

            const bottomY = canvas.height - 20;
            ctx.strokeText(meme.bottomText, canvas.width / 2, bottomY);
            ctx.fillText(meme.bottomText, canvas.width / 2, bottomY);
        };
        img.src = meme.imageUrl || uploadedImage;
    }, [meme, uploadedImage]);

    useEffect(() => {
        if (status.message) {
            const timer = setTimeout(() => setStatus({ message: '', type: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    return (
        <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', color: 'white', marginBottom: '40px' }}>
                    <h1 style={{ 
                        fontSize: '3em', 
                        marginBottom: '10px', 
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)' 
                    }}>
                        🎨 Meme Generator
                    </h1>
                    <p style={{ fontSize: '1.1em', opacity: 0.9 }}>
                        Create hilarious memes with custom text!
                    </p>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '30px', 
                    marginBottom: '30px' 
                }}>
                    {/* Controls */}
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '12px', 
                        padding: '25px', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)' 
                    }}>
                        <h2 style={{ 
                            fontSize: '1.5em', 
                            marginBottom: '20px', 
                            color: '#333', 
                            borderBottom: '3px solid #667eea', 
                            paddingBottom: '10px' 
                        }}>
                            Create Your Meme
                        </h2>

                        {status.message && (
                            <div style={{
                                marginBottom: '15px',
                                padding: '12px',
                                borderRadius: '6px',
                                textAlign: 'center',
                                fontWeight: '600',
                                background: status.type === 'success' ? '#d4edda' : '#f8d7da',
                                color: status.type === 'success' ? '#155724' : '#721c24'
                            }}>
                                {status.message}
                            </div>
                        )}

                        {/* Template Tabs */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            marginBottom: '15px', 
                            borderBottom: '2px solid #e0e0e0',
                            overflowX: 'auto',
                            flexWrap: 'wrap'
                        }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        padding: '10px 15px',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9em',
                                        color: activeTab === tab.id ? '#667eea' : '#666'
                                    }}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Templates */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                            gap: '10px', 
                            marginBottom: '18px' 
                        }}>
                            {templates[activeTab].map(template => (
                                <button
                                    key={template.url}
                                    onClick={() => handleTemplateSelect(template)}
                                    style={{
                                        padding: '10px',
                                        background: activeTemplate === template.url ? '#667eea' : '#f0f0f0',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.80em',
                                        fontWeight: '600',
                                        color: activeTemplate === template.url ? 'white' : '#333',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5em' }}>{template.icon}</span>
                                    {template.name}
                                </button>
                            ))}
                        </div>

                        {/* Upload */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                                Or Upload Your Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '6px'
                                }}
                            />
                        </div>

                        {/* Text Inputs */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                                Top Text
                            </label>
                            <textarea
                                value={meme.topText}
                                onChange={(e) => updateMemeText('topText', e.target.value)}
                                placeholder="Enter top text..."
                                maxLength={100}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '6px',
                                    resize: 'vertical',
                                    minHeight: '60px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                                Bottom Text
                            </label>
                            <textarea
                                value={meme.bottomText}
                                onChange={(e) => updateMemeText('bottomText', e.target.value)}
                                placeholder="Enter bottom text..."
                                maxLength={100}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '6px',
                                    resize: 'vertical',
                                    minHeight: '60px'
                                }}
                            />
                        </div>

                        {/* Colors */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                                Text Color
                            </label>
                            <input
                                type="color"
                                value={meme.textColor}
                                onChange={(e) => setMeme(prev => ({ ...prev, textColor: e.target.value }))}
                                style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                                Stroke Color
                            </label>
                            <input
                                type="color"
                                value={meme.strokeColor}
                                onChange={(e) => setMeme(prev => ({ ...prev, strokeColor: e.target.value }))}
                                style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                            />
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '25px' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333', fontSize: '0.95em' }}>
                                    Font Size
                                </label>
                                <input
                                    type="number"
                                    value={meme.fontSize}
                                    onChange={(e) => setMeme(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                                    min="10"
                                    max="100"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '6px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333', fontSize: '0.95em' }}>
                                    Stroke Width
                                </label>
                                <input
                                    type="number"
                                    value={meme.strokeWidth}
                                    onChange={(e) => setMeme(prev => ({ ...prev, strokeWidth: parseInt(e.target.value) }))}
                                    min="0"
                                    max="10"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '6px'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <button
                                onClick={() => setMeme(prev => ({ ...prev }))}
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '1em',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white'
                                }}
                            >
                                Generate Meme
                            </button>
                            <button
                                onClick={resetMeme}
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '1em',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    background: '#f0f0f0',
                                    color: '#333'
                                }}
                            >
                                Reset
                            </button>
                        </div>

                        <button
                            onClick={downloadMeme}
                            style={{
                                width: '100%',
                                padding: '12px 20px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '1em',
                                fontWeight: '600',
                                cursor: 'pointer',
                                background: '#ff6b6b',
                                color: 'white'
                            }}
                        >
                            ⬇️ Download Meme
                        </button>
                    </div>

                    {/* Preview */}
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '12px', 
                        padding: '25px', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <h2 style={{ 
                            fontSize: '1.5em', 
                            marginBottom: '20px', 
                            color: '#333', 
                            borderBottom: '3px solid #667eea', 
                            paddingBottom: '10px',
                            width: '100%'
                        }}>
                            Preview
                        </h2>
                        <canvas
                            ref={canvasRef}
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                border: '3px solid #667eea',
                                borderRadius: '8px',
                                background: '#f0f0f0',
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                </div>

                {/* Back Button */}
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            padding: '15px 30px',
                            fontSize: '1.2em',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: 'red',
                            color: 'black',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                        }}
                    >
                        ← Back
                    </button>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    div[style*="grid-template-columns: '1fr 1fr'"] {
                        grid-template-columns: 1fr !important;
                    }
                    h1[style*="font-size: '3em'"] {
                        font-size: 2em !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MemeGenerator;
