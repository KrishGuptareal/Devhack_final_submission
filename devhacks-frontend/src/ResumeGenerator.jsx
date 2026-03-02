import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { enhanceWithAI, isAIAvailable } from "./constants/geminiEnhancer";
import html2pdf from "html2pdf.js";

function ResumeGenerator() {
    const { user } = useUser();
    const resumeRef = useRef(null);
    const [isEnhanced, setIsEnhanced] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);

    // Personal Information
    const [personalInfo, setPersonalInfo] = useState({
        fullName: user?.fullName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        phone: "",
        location: "",
        summary: ""
    });

    // Education entries
    const [education, setEducation] = useState([
        { id: Date.now(), degree: "", institution: "", field: "", year: "", gpa: "" }
    ]);

    // Work Experience
    const [experience, setExperience] = useState([
        { id: Date.now(), title: "", company: "", duration: "", description: "", originalDescription: "" }
    ]);

    // Skills
    const [skills, setSkills] = useState({
        languages: "",
        frameworks: "",
        tools: "",
        other: ""
    });

    // Projects
    const [projects, setProjects] = useState([
        { id: Date.now(), name: "", description: "", technologies: "", link: "", originalDescription: "" }
    ]);

    // Certifications
    const [certifications, setCertifications] = useState([
        { id: Date.now(), name: "", issuer: "", date: "" }
    ]);

    // Add/Remove handlers
    const addEducation = () => setEducation([...education, { id: Date.now(), degree: "", institution: "", field: "", year: "", gpa: "" }]);
    const removeEducation = (id) => setEducation(education.filter(e => e.id !== id));

    const addExperience = () => setExperience([...experience, { id: Date.now(), title: "", company: "", duration: "", description: "", originalDescription: "" }]);
    const removeExperience = (id) => setExperience(experience.filter(e => e.id !== id));

    const addProject = () => setProjects([...projects, { id: Date.now(), name: "", description: "", technologies: "", link: "", originalDescription: "" }]);
    const removeProject = (id) => setProjects(projects.filter(p => p.id !== id));

    const addCertification = () => setCertifications([...certifications, { id: Date.now(), name: "", issuer: "", date: "" }]);
    const removeCertification = (id) => setCertifications(certifications.filter(c => c.id !== id));

    // Update handlers
    const updatePersonal = (field, value) => setPersonalInfo({ ...personalInfo, [field]: value });

    const updateEducation = (id, field, value) => {
        setEducation(education.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const updateExperience = (id, field, value) => {
        setExperience(experience.map(e => {
            if (e.id === id) {
                if (field === 'description' && !e.originalDescription) {
                    return { ...e, [field]: value, originalDescription: value };
                }
                return { ...e, [field]: value };
            }
            return e;
        }));
    };

    const updateSkills = (field, value) => setSkills({ ...skills, [field]: value });

    const updateProject = (id, field, value) => {
        setProjects(projects.map(p => {
            if (p.id === id) {
                if (field === 'description' && !p.originalDescription) {
                    return { ...p, [field]: value, originalDescription: value };
                }
                return { ...p, [field]: value };
            }
            return p;
        }));
    };

    const updateCertification = (id, field, value) => {
        setCertifications(certifications.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    // Enhancement handler with AI
    const handleEnhance = async () => {
        if (isEnhanced && !showOriginal) {
            // Revert to original
            setExperience(experience.map(e => ({
                ...e,
                description: e.originalDescription || e.description
            })));
            setProjects(projects.map(p => ({
                ...p,
                description: p.originalDescription || p.description
            })));
            setPersonalInfo({
                ...personalInfo,
                summary: personalInfo.originalSummary || personalInfo.summary
            });
            setIsEnhanced(false);
        } else {
            // Enhance text with AI
            setIsEnhancing(true);
            try {
                // Enhance experience descriptions
                const enhancedExperience = await Promise.all(
                    experience.map(async (e) => ({
                        ...e,
                        originalDescription: e.originalDescription || e.description,
                        description: e.description ? await enhanceWithAI(e.description, "work experience") : e.description
                    }))
                );
                setExperience(enhancedExperience);

                // Enhance project descriptions
                const enhancedProjects = await Promise.all(
                    projects.map(async (p) => ({
                        ...p,
                        originalDescription: p.originalDescription || p.description,
                        description: p.description ? await enhanceWithAI(p.description, "project") : p.description
                    }))
                );
                setProjects(enhancedProjects);

                // Enhance summary
                if (personalInfo.summary) {
                    const enhancedSummary = await enhanceWithAI(personalInfo.summary, "professional summary");
                    setPersonalInfo({
                        ...personalInfo,
                        originalSummary: personalInfo.originalSummary || personalInfo.summary,
                        summary: enhancedSummary
                    });
                }

                setIsEnhanced(true);
            } catch (error) {
                console.error("Enhancement failed:", error);
                alert("Enhancement failed. Please check your API key.");
            } finally {
                setIsEnhancing(false);
            }
        }
    };

    // PDF Export
    const handleDownloadPDF = () => {
        const element = resumeRef.current;
        const opt = {
            margin: 0.5,
            filename: `${personalInfo.fullName || 'Resume'}_Resume.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    // Styles
    const inputStyle = {
        width: "100%",
        padding: "12px 16px",
        borderRadius: "10px",
        border: "2px solid rgba(255, 255, 255, 0.15)",
        background: "rgba(15, 23, 42, 0.8)",
        color: "#fff",
        fontSize: "14px",
        outline: "none",
        transition: "border-color 0.2s"
    };

    const labelStyle = {
        fontSize: "12px",
        fontWeight: "600",
        color: "#94a3b8",
        marginBottom: "6px",
        display: "block",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    };

    const sectionStyle = {
        marginBottom: "24px",
        padding: "20px",
        background: "rgba(255, 255, 255, 0.03)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.08)"
    };

    const addButtonStyle = {
        padding: "10px 16px",
        borderRadius: "10px",
        border: "2px dashed rgba(99, 102, 241, 0.4)",
        background: "transparent",
        color: "#818cf8",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        width: "100%",
        marginTop: "12px"
    };

    const removeButtonStyle = {
        background: "none",
        border: "none",
        color: "#ef4444",
        cursor: "pointer",
        fontSize: "18px",
        padding: "4px"
    };

    return (
        <div className="dashboard-container" style={{ padding: "20px", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <Link to="/dashboard" style={{
                        padding: "10px 16px",
                        borderRadius: "12px",
                        background: "rgba(99, 102, 241, 0.15)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        color: "#818cf8",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "14px"
                    }}>
                        ← Dashboard
                    </Link>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", margin: 0 }}>
                        📄 Resume Generator
                    </h1>
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                    {isAIAvailable() && (
                        <span style={{ fontSize: "12px", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                            🤖 AI Powered
                        </span>
                    )}
                    <button
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "10px",
                            border: "none",
                            background: isEnhancing ? "rgba(99, 102, 241, 0.3)" : isEnhanced ? "rgba(16, 185, 129, 0.2)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            color: "#fff",
                            fontWeight: "600",
                            cursor: isEnhancing ? "wait" : "pointer",
                            fontSize: "14px",
                            opacity: isEnhancing ? 0.7 : 1
                        }}
                    >
                        {isEnhancing ? "⏳ Enhancing..." : isEnhanced ? "✓ Enhanced (Click to Revert)" : "✨ Enhance with AI"}
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "10px",
                            border: "2px solid rgba(99, 102, 241, 0.3)",
                            background: "rgba(99, 102, 241, 0.1)",
                            color: "#818cf8",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        📥 Download PDF
                    </button>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="resume-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

                {/* LEFT: Form */}
                <div className="resume-form" style={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto", paddingRight: "8px" }}>

                    {/* Personal Information */}
                    <div style={sectionStyle}>
                        <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "#fff" }}>👤 Personal Information</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                                <label style={labelStyle}>Full Name *</label>
                                <input style={inputStyle} placeholder="John Doe" value={personalInfo.fullName} onChange={e => updatePersonal('fullName', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Email *</label>
                                <input style={inputStyle} type="email" placeholder="john@email.com" value={personalInfo.email} onChange={e => updatePersonal('email', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone</label>
                                <input style={inputStyle} placeholder="+1 234 567 8900" value={personalInfo.phone} onChange={e => updatePersonal('phone', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Location</label>
                                <input style={inputStyle} placeholder="New York, NY" value={personalInfo.location} onChange={e => updatePersonal('location', e.target.value)} />
                            </div>
                        </div>
                        <div style={{ marginTop: "12px" }}>
                            <label style={labelStyle}>Professional Summary</label>
                            <textarea
                                style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                                placeholder="A brief 2-3 sentence summary of your professional background..."
                                value={personalInfo.summary}
                                onChange={e => updatePersonal('summary', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Education */}
                    <div style={sectionStyle}>
                        <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "#fff" }}>🎓 Education</h3>
                        {education.map((edu, idx) => (
                            <div key={edu.id} style={{ marginBottom: idx < education.length - 1 ? "16px" : 0, paddingBottom: idx < education.length - 1 ? "16px" : 0, borderBottom: idx < education.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <span style={{ fontSize: "13px", color: "#64748b" }}>Entry #{idx + 1}</span>
                                    {education.length > 1 && <button style={removeButtonStyle} onClick={() => removeEducation(edu.id)}>✕</button>}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div>
                                        <label style={labelStyle}>Degree</label>
                                        <input style={inputStyle} placeholder="B.Tech" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Institution</label>
                                        <input style={inputStyle} placeholder="MIT" value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Field of Study</label>
                                        <input style={inputStyle} placeholder="Computer Science" value={edu.field} onChange={e => updateEducation(edu.id, 'field', e.target.value)} />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                        <div>
                                            <label style={labelStyle}>Year</label>
                                            <input style={inputStyle} placeholder="2024" value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>GPA</label>
                                            <input style={inputStyle} placeholder="9.0" value={edu.gpa} onChange={e => updateEducation(edu.id, 'gpa', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button style={addButtonStyle} onClick={addEducation}>+ Add Education</button>
                    </div>

                    {/* Work Experience */}
                    <div style={sectionStyle}>
                        <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "#fff" }}>💼 Work Experience</h3>
                        {experience.map((exp, idx) => (
                            <div key={exp.id} style={{ marginBottom: idx < experience.length - 1 ? "16px" : 0, paddingBottom: idx < experience.length - 1 ? "16px" : 0, borderBottom: idx < experience.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <span style={{ fontSize: "13px", color: "#64748b" }}>Role #{idx + 1}</span>
                                    {experience.length > 1 && <button style={removeButtonStyle} onClick={() => removeExperience(exp.id)}>✕</button>}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div>
                                        <label style={labelStyle}>Job Title</label>
                                        <input style={inputStyle} placeholder="Software Engineer" value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Company</label>
                                        <input style={inputStyle} placeholder="Google" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ marginTop: "12px" }}>
                                    <label style={labelStyle}>Duration</label>
                                    <input style={inputStyle} placeholder="Jan 2022 - Present" value={exp.duration} onChange={e => updateExperience(exp.id, 'duration', e.target.value)} />
                                </div>
                                <div style={{ marginTop: "12px" }}>
                                    <label style={labelStyle}>Description / Responsibilities</label>
                                    <textarea
                                        style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                                        placeholder="Describe your responsibilities and achievements..."
                                        value={exp.description}
                                        onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button style={addButtonStyle} onClick={addExperience}>+ Add Experience</button>
                    </div>

                    {/* Technical Skills */}
                    <div style={sectionStyle}>
                        <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "#fff" }}>🛠️ Technical Skills</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                                <label style={labelStyle}>Languages</label>
                                <input style={inputStyle} placeholder="JavaScript, Python, C++" value={skills.languages} onChange={e => updateSkills('languages', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Frameworks</label>
                                <input style={inputStyle} placeholder="React, Node.js, Django" value={skills.frameworks} onChange={e => updateSkills('frameworks', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Tools</label>
                                <input style={inputStyle} placeholder="Git, Docker, AWS" value={skills.tools} onChange={e => updateSkills('tools', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Other</label>
                                <input style={inputStyle} placeholder="Agile, Scrum, REST APIs" value={skills.other} onChange={e => updateSkills('other', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Projects */}
                    <div style={sectionStyle}>
                        <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "#fff" }}>🚀 Projects</h3>
                        {projects.map((proj, idx) => (
                            <div key={proj.id} style={{ marginBottom: idx < projects.length - 1 ? "16px" : 0, paddingBottom: idx < projects.length - 1 ? "16px" : 0, borderBottom: idx < projects.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <span style={{ fontSize: "13px", color: "#64748b" }}>Project #{idx + 1}</span>
                                    {projects.length > 1 && <button style={removeButtonStyle} onClick={() => removeProject(proj.id)}>✕</button>}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div>
                                        <label style={labelStyle}>Project Name</label>
                                        <input style={inputStyle} placeholder="E-Commerce Platform" value={proj.name} onChange={e => updateProject(proj.id, 'name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Technologies</label>
                                        <input style={inputStyle} placeholder="React, Node.js, MongoDB" value={proj.technologies} onChange={e => updateProject(proj.id, 'technologies', e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ marginTop: "12px" }}>
                                    <label style={labelStyle}>Description</label>
                                    <textarea
                                        style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
                                        placeholder="Brief description of the project..."
                                        value={proj.description}
                                        onChange={e => updateProject(proj.id, 'description', e.target.value)}
                                    />
                                </div>
                                <div style={{ marginTop: "12px" }}>
                                    <label style={labelStyle}>Link (optional)</label>
                                    <input style={inputStyle} placeholder="https://github.com/..." value={proj.link} onChange={e => updateProject(proj.id, 'link', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button style={addButtonStyle} onClick={addProject}>+ Add Project</button>
                    </div>

                    {/* Certifications */}
                    <div style={sectionStyle}>
                        <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "#fff" }}>📜 Certifications</h3>
                        {certifications.map((cert, idx) => (
                            <div key={cert.id} style={{ marginBottom: idx < certifications.length - 1 ? "16px" : 0, paddingBottom: idx < certifications.length - 1 ? "16px" : 0, borderBottom: idx < certifications.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <span style={{ fontSize: "13px", color: "#64748b" }}>Certification #{idx + 1}</span>
                                    {certifications.length > 1 && <button style={removeButtonStyle} onClick={() => removeCertification(cert.id)}>✕</button>}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                                    <div>
                                        <label style={labelStyle}>Name</label>
                                        <input style={inputStyle} placeholder="AWS Solutions Architect" value={cert.name} onChange={e => updateCertification(cert.id, 'name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Issuer</label>
                                        <input style={inputStyle} placeholder="Amazon" value={cert.issuer} onChange={e => updateCertification(cert.id, 'issuer', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Date</label>
                                        <input style={inputStyle} placeholder="2023" value={cert.date} onChange={e => updateCertification(cert.id, 'date', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button style={addButtonStyle} onClick={addCertification}>+ Add Certification</button>
                    </div>
                </div>

                {/* RIGHT: Live Preview */}
                <div className="resume-preview-container" style={{
                    background: "#fff",
                    borderRadius: "16px",
                    maxHeight: "calc(100vh - 120px)",
                    overflowY: "auto",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                }}>
                    <div ref={resumeRef} style={{ padding: "40px", color: "#1f2937", fontFamily: "'Inter', sans-serif" }}>
                        {/* Resume Header */}
                        <div style={{ textAlign: "center", marginBottom: "24px", borderBottom: "2px solid #2563eb", paddingBottom: "20px" }}>
                            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", margin: "0 0 8px 0" }}>
                                {personalInfo.fullName || "Your Name"}
                            </h1>
                            <div style={{ fontSize: "13px", color: "#64748b", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                                {personalInfo.email && <span>📧 {personalInfo.email}</span>}
                                {personalInfo.phone && <span>📱 {personalInfo.phone}</span>}
                                {personalInfo.location && <span>📍 {personalInfo.location}</span>}
                            </div>
                        </div>

                        {/* Summary */}
                        {personalInfo.summary && (
                            <div style={{ marginBottom: "20px" }}>
                                <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                                    Professional Summary
                                </h2>
                                <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#374151", margin: 0 }}>{personalInfo.summary}</p>
                            </div>
                        )}

                        {/* Education */}
                        {education.some(e => e.degree || e.institution) && (
                            <div style={{ marginBottom: "20px" }}>
                                <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                                    Education
                                </h2>
                                {education.filter(e => e.degree || e.institution).map(edu => (
                                    <div key={edu.id} style={{ marginBottom: "10px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                            <strong style={{ fontSize: "14px", color: "#1e293b" }}>{edu.degree} {edu.field && `in ${edu.field}`}</strong>
                                            <span style={{ fontSize: "12px", color: "#64748b" }}>{edu.year}</span>
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#475569" }}>
                                            {edu.institution} {edu.gpa && <span style={{ color: "#6b7280" }}>• GPA: {edu.gpa}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Experience */}
                        {experience.some(e => e.title || e.company) && (
                            <div style={{ marginBottom: "20px" }}>
                                <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                                    Work Experience
                                </h2>
                                {experience.filter(e => e.title || e.company).map(exp => (
                                    <div key={exp.id} style={{ marginBottom: "14px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                            <strong style={{ fontSize: "14px", color: "#1e293b" }}>{exp.title}</strong>
                                            <span style={{ fontSize: "12px", color: "#64748b" }}>{exp.duration}</span>
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#6366f1", fontWeight: "500", marginBottom: "4px" }}>{exp.company}</div>
                                        {exp.description && (
                                            <p style={{ fontSize: "12px", lineHeight: "1.5", color: "#4b5563", margin: 0 }}>{exp.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Skills */}
                        {(skills.languages || skills.frameworks || skills.tools || skills.other) && (
                            <div style={{ marginBottom: "20px" }}>
                                <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                                    Technical Skills
                                </h2>
                                <div style={{ fontSize: "13px", color: "#374151" }}>
                                    {skills.languages && <div><strong>Languages:</strong> {skills.languages}</div>}
                                    {skills.frameworks && <div><strong>Frameworks:</strong> {skills.frameworks}</div>}
                                    {skills.tools && <div><strong>Tools:</strong> {skills.tools}</div>}
                                    {skills.other && <div><strong>Other:</strong> {skills.other}</div>}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {projects.some(p => p.name) && (
                            <div style={{ marginBottom: "20px" }}>
                                <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                                    Projects
                                </h2>
                                {projects.filter(p => p.name).map(proj => (
                                    <div key={proj.id} style={{ marginBottom: "12px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                            <strong style={{ fontSize: "14px", color: "#1e293b" }}>{proj.name}</strong>
                                            {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#2563eb" }}>🔗 Link</a>}
                                        </div>
                                        {proj.technologies && <div style={{ fontSize: "12px", color: "#6366f1", marginBottom: "4px" }}>{proj.technologies}</div>}
                                        {proj.description && <p style={{ fontSize: "12px", lineHeight: "1.5", color: "#4b5563", margin: 0 }}>{proj.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Certifications */}
                        {certifications.some(c => c.name) && (
                            <div style={{ marginBottom: "20px" }}>
                                <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                                    Certifications
                                </h2>
                                {certifications.filter(c => c.name).map(cert => (
                                    <div key={cert.id} style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ fontSize: "13px", color: "#1e293b" }}><strong>{cert.name}</strong> - {cert.issuer}</span>
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>{cert.date}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Responsive Styles */}
            <style>{`
        @media (max-width: 900px) {
          .resume-layout {
            grid-template-columns: 1fr !important;
          }
          .resume-form, .resume-preview-container {
            max-height: none !important;
          }
        }
        @media (max-width: 600px) {
          .dashboard-container {
            padding: 12px !important;
          }
        }
      `}</style>
        </div>
    );
}

export default ResumeGenerator;
