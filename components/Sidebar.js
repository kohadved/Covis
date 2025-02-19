import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiActivity, FiUser, FiShield } from "react-icons/fi";
import styles from "../styles/Sidebar.module.css";

const Sidebar = ({ stats, hospitals }) => {
    const [virality, setVirality] = useState(stats.virality);

    const handleViralityChange = (e) => {
        setVirality(e.target.value);
    };

    return (
        <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className={styles.sidebarContainer}
        >
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                COVID‑19 Monitoring Dashboard
            </motion.h2>

            {/* Overall Stats */}
            <div className={styles.statsCard}>
                <h3>Overall Statistics</h3>
                <StatItem icon={<FiUser />} label="Total People" value={stats.total} />
                <StatItem icon={<FiActivity />} label="Infected" value={stats.infected} color="text-red-500" />
                <StatItem icon={<FiShield />} label="Locked (in lockdown)" value={stats.locked} color="text-yellow-400" />
            </div>

            {/* Virality Factor Slider */}
            <div className={styles.sliderCard}>
                <h3>Virality Factor</h3>
                <div className={styles.sliderContainer}>
                    <div className={styles.sliderTrack}>
                        <div
                            className={styles.sliderFill}
                            style={{ width: `${((virality - 1) / 2) * 100}%` }}
                        ></div>
                    </div>
                    <input
                        type="range"
                        min="1.0"
                        max="3.0"
                        step="0.1"
                        value={virality}
                        onChange={handleViralityChange}
                        className={styles.slider}
                    />
                    <span className={styles.sliderValue}>{virality}</span>
                </div>
            </div>


            {/* Hospital Shortages */}
            <div className={styles.hospitalCard}>
                <h3>Hospital Shortages</h3>
                {hospitals.map((hosp) => (
                    <motion.div key={hosp.id} whileHover={{ scale: 1.02 }} className={styles.hospitalItem}>
                        <h4>{hosp.name}</h4>
                        <ProgressBar label="ICU" value={hosp.icuShortage} color="orange" />
                        <ProgressBar label="Medicine" value={hosp.medShortage} color="purple" />
                    </motion.div>
                ))}
            </div>
        </motion.aside>
    );
};

// Stat Item Component
const StatItem = ({ icon, label, value, color = "text-white" }) => (
    <motion.div whileHover={{ scale: 1.05 }} className={styles.statItem}>
        <div className={styles.icon}>{icon}</div>
        <span>{label}</span>
        <strong className={color}>{value}</strong>
    </motion.div>
);

// Progress Bar Component
const ProgressBar = ({ label, value, color }) => (
    <div className={styles.progressBar}>
        <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1 }}
            className={styles.progressFill}
            style={{ backgroundColor: color }}
        />
        <span className={styles.progressLabel}>
            {label}: {value}%
        </span>
    </div>
);

export default Sidebar;
