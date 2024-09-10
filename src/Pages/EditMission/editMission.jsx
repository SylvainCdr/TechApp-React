import styles from './style.module.scss';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import MissionForm from '../../Components/missionForm/missionForm';

export default function EditMission() {


    return (
        <div className={styles.editMissionContainer}>
        <h1>Modifier une fiche mission</h1>

        <MissionForm />


        </div>
    );
    }

