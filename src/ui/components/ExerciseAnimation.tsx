import React from 'react';
import { EXERCISE_ANIMATIONS, type ExercisePose } from '@/data/animations';

interface Props {
  animationId?: string;
  paused?: boolean;
  forceView?: 'front' | 'side';
}

const limb = { upperArm: 30, forearm: 26, upperLeg: 36, lowerLeg: 34 };
const BODY = { shoulderY: 66, hipY: 104, leftX: 82, rightX: 118 };

function rad(deg: number) { return (deg * Math.PI) / 180; }
function endPoint(x: number, y: number, len: number, angle: number) {
  return { x: x + Math.cos(rad(angle)) * len, y: y + Math.sin(rad(angle)) * len };
}

function posePoints(pose: ExercisePose, view: 'front' | 'side') {
  const torsoBase = { x: 100, y: 108 };
  const torsoTop = endPoint(torsoBase.x, torsoBase.y, 46, -90 + pose.torsoLean);
  const shoulderL = view === 'front' ? { x: BODY.leftX, y: BODY.shoulderY } : { x: 92, y: 68 };
  const shoulderR = view === 'front' ? { x: BODY.rightX, y: BODY.shoulderY } : { x: 108, y: 68 };
  const hipL = view === 'front' ? { x: 90, y: BODY.hipY } : { x: 96, y: 106 };
  const hipR = view === 'front' ? { x: 110, y: BODY.hipY } : { x: 104, y: 106 };

  const elbowL = endPoint(shoulderL.x, shoulderL.y, limb.upperArm, pose.leftShoulder);
  const elbowR = endPoint(shoulderR.x, shoulderR.y, limb.upperArm, pose.rightShoulder);
  const handL = endPoint(elbowL.x, elbowL.y, limb.forearm, pose.leftShoulder + pose.leftElbow);
  const handR = endPoint(elbowR.x, elbowR.y, limb.forearm, pose.rightShoulder + pose.rightElbow);

  const kneeL = endPoint(hipL.x, hipL.y, limb.upperLeg, 90 + pose.leftHip);
  const kneeR = endPoint(hipR.x, hipR.y, limb.upperLeg, 90 + pose.rightHip);
  const footL = endPoint(kneeL.x, kneeL.y, limb.lowerLeg, 90 + pose.leftHip - pose.leftKnee);
  const footR = endPoint(kneeR.x, kneeR.y, limb.lowerLeg, 90 + pose.rightHip - pose.rightKnee);

  return { torsoBase, torsoTop, shoulderL, shoulderR, hipL, hipR, elbowL, elbowR, handL, handR, kneeL, kneeR, footL, footR };
}

function line(a: {x:number;y:number}, b: {x:number;y:number}, key: string) {
  return <line key={key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#E9EEF5" strokeWidth="10" strokeLinecap="round" />;
}

export function ExerciseAnimation({ animationId, paused = false, forceView }: Props) {
  const data = (animationId && EXERCISE_ANIMATIONS[animationId]) || EXERCISE_ANIMATIONS.plank;
  const view = forceView || data.view;
  const start = posePoints(data.startPose, view);
  const cycle = `ia-${data.exerciseId}`;
  const animation = `${cycle} ${data.duration}ms ease-in-out infinite alternate`;

  const equipment = data.equipment !== 'none' && (
    <g style={{ animationPlayState: paused ? 'paused' : 'running' }}>
      {data.equipmentConfig?.bench && (
        <rect x={data.equipmentConfig.bench.x} y={data.equipmentConfig.bench.y} width={data.equipmentConfig.bench.width} height="10" rx="5" fill="#6B7B8D" transform={data.equipmentConfig.bench.angle ? `rotate(${data.equipmentConfig.bench.angle} ${data.equipmentConfig.bench.x} ${data.equipmentConfig.bench.y})` : undefined} />
      )}
      {data.equipment === 'barbell' && (
        <g>
          <line x1={start.handL.x} y1={start.handL.y} x2={start.handR.x} y2={start.handR.y} stroke="#6B7B8D" strokeWidth="6" style={{ animation }} />
          <circle cx={start.handL.x - 6} cy={start.handL.y} r="7" fill="#6B7B8D" style={{ animation }} />
          <circle cx={start.handR.x + 6} cy={start.handR.y} r="7" fill="#6B7B8D" style={{ animation }} />
        </g>
      )}
      {data.equipment === 'dumbbell' && (
        <g>
          <rect x={start.handL.x - 7} y={start.handL.y - 2} width="14" height="4" rx="2" fill="#6B7B8D" style={{ animation }} />
          <rect x={start.handR.x - 7} y={start.handR.y - 2} width="14" height="4" rx="2" fill="#6B7B8D" style={{ animation }} />
        </g>
      )}
      {data.equipment === 'cable' && data.equipmentConfig?.cableAnchor && (
        <g>
          <circle cx={data.equipmentConfig.cableAnchor.x} cy={data.equipmentConfig.cableAnchor.y} r="4" fill="#6B7B8D" />
          <line x1={data.equipmentConfig.cableAnchor.x} y1={data.equipmentConfig.cableAnchor.y} x2={start.handR.x} y2={start.handR.y} stroke="#6B7B8D" strokeWidth="2" style={{ animation }} />
        </g>
      )}
      {data.equipment === 'machine' && data.equipmentConfig?.machine && (
        <rect x={data.equipmentConfig.machine.x} y={data.equipmentConfig.machine.y} width={data.equipmentConfig.machine.width} height={data.equipmentConfig.machine.height} rx="8" fill="none" stroke="#6B7B8D" strokeWidth="2" />
      )}
      {data.equipmentConfig?.bars && <line x1="58" y1={data.equipmentConfig.bars.y || 92} x2="142" y2={data.equipmentConfig.bars.y || 92} stroke="#6B7B8D" strokeWidth="6" />}
    </g>
  );

  return (
    <div style={{ background: '#11161c', borderRadius: 12, border: '1px solid #232e3d', padding: 8 }}>
      <style>{`@keyframes ${cycle}{from{transform:translateY(0px)}to{transform:translateY(${data.movementHint === 'static' ? -2 : -8}px)}}`}</style>
      <svg viewBox="0 0 200 200" width="100%" style={{ maxHeight: 220 }}>
        {equipment}
        <g style={{ animation, animationPlayState: paused ? 'paused' : 'running', transformOrigin: '100px 100px' }}>
          <circle cx="100" cy="32" r="14" fill="#E9EEF5" />
          <rect x="82" y="48" width="36" height="62" rx="16" fill="#DCE3EC" />
          {line(start.shoulderL, start.elbowL, 'uaL')}
          {line(start.elbowL, start.handL, 'faL')}
          {line(start.shoulderR, start.elbowR, 'uaR')}
          {line(start.elbowR, start.handR, 'faR')}
          {line(start.hipL, start.kneeL, 'ulL')}
          {line(start.kneeL, start.footL, 'llL')}
          {line(start.hipR, start.kneeR, 'ulR')}
          {line(start.kneeR, start.footR, 'llR')}
          {[start.shoulderL, start.elbowL, start.handL, start.shoulderR, start.elbowR, start.handR, start.hipL, start.kneeL, start.hipR, start.kneeR].map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="#FFFFFF" />
          ))}
        </g>
        {!animationId && <path d="M160 24 L184 40 L160 56" fill="none" stroke="#FF9500" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </div>
  );
}

export default ExerciseAnimation;
