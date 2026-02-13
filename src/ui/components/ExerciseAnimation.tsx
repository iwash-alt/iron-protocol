import React from 'react';
import { EXERCISE_ANIMATIONS, type ExercisePose } from '@/data/animations';

interface Props {
  animationId?: string;
  paused?: boolean;
  forceView?: 'front' | 'side';
}

const LIMB = { upperArm: 28, forearm: 26, upperLeg: 34, lowerLeg: 34 };

type Point = { x: number; y: number };

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function endPoint(x: number, y: number, len: number, angle: number): Point {
  return { x: x + Math.cos(toRad(angle)) * len, y: y + Math.sin(toRad(angle)) * len };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function blendPose(start: ExercisePose, end: ExercisePose, t: number): ExercisePose {
  return {
    torsoLean: lerp(start.torsoLean, end.torsoLean, t),
    leftShoulder: lerp(start.leftShoulder, end.leftShoulder, t),
    leftElbow: lerp(start.leftElbow, end.leftElbow, t),
    rightShoulder: lerp(start.rightShoulder, end.rightShoulder, t),
    rightElbow: lerp(start.rightElbow, end.rightElbow, t),
    leftHip: lerp(start.leftHip, end.leftHip, t),
    leftKnee: lerp(start.leftKnee, end.leftKnee, t),
    rightHip: lerp(start.rightHip, end.rightHip, t),
    rightKnee: lerp(start.rightKnee, end.rightKnee, t),
  };
}

function posePoints(pose: ExercisePose, view: 'front' | 'side') {
  const shoulderL = view === 'front' ? { x: 84, y: 68 } : { x: 92, y: 68 };
  const shoulderR = view === 'front' ? { x: 116, y: 68 } : { x: 108, y: 68 };
  const hipL = view === 'front' ? { x: 90, y: 106 } : { x: 96, y: 106 };
  const hipR = view === 'front' ? { x: 110, y: 106 } : { x: 104, y: 106 };

  const elbowL = endPoint(shoulderL.x, shoulderL.y, LIMB.upperArm, pose.leftShoulder);
  const elbowR = endPoint(shoulderR.x, shoulderR.y, LIMB.upperArm, pose.rightShoulder);
  const handL = endPoint(elbowL.x, elbowL.y, LIMB.forearm, pose.leftShoulder + pose.leftElbow);
  const handR = endPoint(elbowR.x, elbowR.y, LIMB.forearm, pose.rightShoulder + pose.rightElbow);

  const kneeL = endPoint(hipL.x, hipL.y, LIMB.upperLeg, 90 + pose.leftHip);
  const kneeR = endPoint(hipR.x, hipR.y, LIMB.upperLeg, 90 + pose.rightHip);
  const footL = endPoint(kneeL.x, kneeL.y, LIMB.lowerLeg, 90 + pose.leftHip - pose.leftKnee);
  const footR = endPoint(kneeR.x, kneeR.y, LIMB.lowerLeg, 90 + pose.rightHip - pose.rightKnee);

  const torsoBottom = { x: 100, y: 108 };
  const torsoTop = endPoint(torsoBottom.x, torsoBottom.y, 44, -90 + pose.torsoLean);

  return { shoulderL, shoulderR, elbowL, elbowR, handL, handR, hipL, hipR, kneeL, kneeR, footL, footR, torsoTop, torsoBottom };
}

function Segment({ from, to, width = 10 }: { from: Point; to: Point; width?: number }) {
  return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#E8EDF4" strokeWidth={width} strokeLinecap="round" />;
}

export function ExerciseAnimation({ animationId, paused = false, forceView }: Props) {
  const data = (animationId && EXERCISE_ANIMATIONS[animationId]) || EXERCISE_ANIMATIONS.squat;
  const view = forceView || data.view;
  const [now, setNow] = React.useState(() => performance.now());

  React.useEffect(() => {
    if (paused) return undefined;
    let frame = 0;
    const step = (time: number) => {
      setNow(time);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [paused]);

  const phase = (now % data.duration) / data.duration;
  const eased = 0.5 - Math.cos(phase * Math.PI * 2) / 2;
  const pose = blendPose(data.startPose, data.endPose, eased);
  const points = posePoints(pose, view);

  const barY = data.equipmentConfig?.bars?.y ?? Math.min(points.handL.y, points.handR.y);
  const barLeft = Math.min(points.handL.x, points.handR.x) - 10;
  const barRight = Math.max(points.handL.x, points.handR.x) + 10;

  return (
    <div style={{ background: 'linear-gradient(180deg,#121922 0%,#0B1017 100%)', borderRadius: 14, border: '1px solid #273447', padding: 10, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>
      <svg viewBox="0 0 200 200" width="100%" style={{ maxHeight: 240 }}>
        {data.equipmentConfig?.bench && (
          <rect
            x={data.equipmentConfig.bench.x}
            y={data.equipmentConfig.bench.y}
            width={data.equipmentConfig.bench.width}
            height="10"
            rx="5"
            fill="#64758A"
            transform={data.equipmentConfig.bench.angle ? `rotate(${data.equipmentConfig.bench.angle} ${data.equipmentConfig.bench.x} ${data.equipmentConfig.bench.y})` : undefined}
          />
        )}

        {data.equipment === 'barbell' && (
          <g>
            <line x1={barLeft} y1={barY} x2={barRight} y2={barY} stroke="#9FAFBE" strokeWidth="6" strokeLinecap="round" />
            <circle cx={barLeft - 5} cy={barY} r="7" fill="#77889A" />
            <circle cx={barRight + 5} cy={barY} r="7" fill="#77889A" />
          </g>
        )}

        <g>
          <circle cx="100" cy="32" r="13" fill="#F3F7FC" />
          <line x1={points.torsoTop.x} y1={points.torsoTop.y} x2={points.torsoBottom.x} y2={points.torsoBottom.y} stroke="#DEE6F0" strokeWidth="14" strokeLinecap="round" />

          <Segment from={points.shoulderL} to={points.elbowL} />
          <Segment from={points.elbowL} to={points.handL} width={9} />
          <Segment from={points.shoulderR} to={points.elbowR} />
          <Segment from={points.elbowR} to={points.handR} width={9} />
          <Segment from={points.hipL} to={points.kneeL} width={11} />
          <Segment from={points.kneeL} to={points.footL} width={10} />
          <Segment from={points.hipR} to={points.kneeR} width={11} />
          <Segment from={points.kneeR} to={points.footR} width={10} />
        </g>
      </svg>
    </div>
  );
}

export default ExerciseAnimation;
