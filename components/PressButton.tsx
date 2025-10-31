// // import React from "react";
// import React, { useEffect, useRef } from "react";
// import {
//     Animated,
//     GestureResponderEvent,
//     PanResponder,
//     PanResponderGestureState,
//     StyleSheet, Text,
//     View
// } from "react-native";

// type Props = {
//     onPressIn: () => void;
//     onPressOut: () => void;
//     onSwipeCancel: () => Promise<void> | void;
//     disabled?: boolean;
//     label?: string;
// };

// // slide threshold in pixels
// const SWIPE_CANCEL_THRESHOLD = 120;

// export default function PTTButton({ onPressIn, onPressOut, onSwipeCancel, disabled, label = "Press to talk" }: Props) {
//     const panX = useRef(new Animated.Value(0)).current;
//     const hasCancelled = useRef(false);
//     const touching = useRef(false);

//     useEffect(() => {
//         // reset on unmount
//         return () => {
//             panX.setValue(0);
//             hasCancelled.current = false;
//             touching.current = false;
//         };
//     }, [panX]);

//     const panResponder = useRef(
//         PanResponder.create({
//             onStartShouldSetPanResponder: () => !disabled,
//             onMoveShouldSetPanResponder: (_evt, gestureState) => {
//                 // start responding when a horizontal move is detected
//                 return Math.abs(gestureState.dx) > 6;
//             },
//             onPanResponderGrant: (_evt: GestureResponderEvent) => {
//                 touching.current = true;
//                 hasCancelled.current = false;
//                 panX.setValue(0);
//                 try {
//                     onPressIn();
//                 } catch { }
//             },
//             onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
//                 // Only allow right swipe for cancel; clamp to [0, SWIPE_CANCEL_THRESHOLD * 1.25]
//                 const dx = Math.max(0, gestureState.dx);
//                 panX.setValue(Math.min(dx, SWIPE_CANCEL_THRESHOLD * 1.25));

//                 if (!hasCancelled.current && dx >= SWIPE_CANCEL_THRESHOLD) {
//                     hasCancelled.current = true;
//                     // animate indicator to show a confirmed cancel
//                     Animated.timing(panX, {
//                         toValue: SWIPE_CANCEL_THRESHOLD,
//                         duration: 120,
//                         useNativeDriver: false,
//                     }).start();
//                     // call cancel callback
//                     Promise.resolve(onSwipeCancel()).catch(() => { });
//                 }
//             },
//             onPanResponderRelease: (_evt, gestureState) => {
//                 touching.current = false;
//                 // If we already cancelled via swipe, just reset and avoid onPressOut processing
//                 if (hasCancelled.current) {
//                     panX.setValue(0);
//                     hasCancelled.current = false;
//                     try {
//                         // Don't call onPressOut since cancellation already handled
//                     } catch { }
//                     return;
//                 }

//                 // otherwise this is a normal release -> call onPressOut
//                 Animated.timing(panX, { toValue: 0, duration: 120, useNativeDriver: false }).start();
//                 try {
//                     onPressOut();
//                 } catch { }
//             },
//             onPanResponderTerminate: () => {
//                 // gesture terminated (e.g., system interruption) -> treat like release
//                 touching.current = false;
//                 if (!hasCancelled.current) {
//                     onPressOut();
//                 } else {
//                     panX.setValue(0);
//                     hasCancelled.current = false;
//                 }
//             },
//         })
//     ).current;

//     // animated styles
//     const translateX = panX.interpolate({
//         inputRange: [0, SWIPE_CANCEL_THRESHOLD * 1.25],
//         outputRange: [0, SWIPE_CANCEL_THRESHOLD * 1.25],
//     });

//     const hintOpacity = panX.interpolate({
//         inputRange: [0, 10, SWIPE_CANCEL_THRESHOLD * 0.6],
//         outputRange: [1, 0.9, 0.4],
//         extrapolate: "clamp",
//     });

//     return (
//         <View style={styles.wrapper}>
//             <Animated.View style={[styles.hintContainer, { transform: [{ translateX }] }]}>
//                 <Animated.Text style={[styles.hintText, { opacity: hintOpacity }]}>Slide right to cancel →</Animated.Text>
//             </Animated.View>

//             <Animated.View
//                 {...panResponder.panHandlers}
//                 style={[styles.btn, { transform: [{ translateX }] }]}
//                 accessibilityLabel="Push to talk"
//             >
//                 <Text style={styles.btnText}>{label}</Text>
//             </Animated.View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     wrapper: {
//         width: "100%",
//         alignItems: "center",
//         justifyContent: "center",
//     },
//     btn: {
//         backgroundColor: "#0057FF",
//         paddingVertical: 14,
//         paddingHorizontal: 28,
//         borderRadius: 28,
//         alignItems: "center",
//         justifyContent: "center",
//         minWidth: 200,
//     },
//     btnText: { color: "white", fontWeight: "700" },
//     hintContainer: {
//         position: "absolute",
//         left: -140,
//         // vertically center relative to button (approx)
//         top: 8,
//     },
//     hintText: {
//         color: "#333",
//         fontWeight: "600",
//     },
// });

///

// // components/PTTButton.tsx
// import React, { useEffect, useRef, useState } from "react";
// import {
//     Animated,
//     GestureResponderEvent,
//     PanResponder,
//     PanResponderGestureState,
//     StyleSheet,
//     Text,
//     View
// } from "react-native";

// type Props = {
//     onPressIn: () => void;
//     onPressOut: () => void;
//     onSwipeCancel: () => Promise<void> | void;
//     disabled?: boolean;
//     label?: string;
//     swipeCancelThreshold?: number; // optional override (px)
// };

// const DEFAULT_THRESHOLD = 120;

// export default function PTTButton({
//     onPressIn,
//     onPressOut,
//     onSwipeCancel,
//     disabled = false,
//     label = "Press to talk",
//     swipeCancelThreshold = DEFAULT_THRESHOLD,
// }: Props) {
//     const panX = useRef(new Animated.Value(0)).current;
//     const hasCancelled = useRef(false);
//     const [isPressed, setIsPressed] = useState(false);

//     useEffect(() => {
//         // reset when disabled changes or on unmount
//         if (disabled) {
//             panX.setValue(0);
//             hasCancelled.current = false;
//             setIsPressed(false);
//         }
//         return () => {
//             panX.setValue(0);
//             hasCancelled.current = false;
//             setIsPressed(false);
//         };
//     }, [disabled, panX]);

//     const threshold = Math.max(48, swipeCancelThreshold); // lower bound

//     const panResponder = useRef(
//         PanResponder.create({
//             onStartShouldSetPanResponder: () => !disabled,
//             onMoveShouldSetPanResponder: (_evt, gestureState) => {
//                 // start responding when horizontal movement dominates
//                 const horizontalDominant = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
//                 return !disabled && horizontalDominant && Math.abs(gestureState.dx) > 6;
//             },
//             onPanResponderGrant: (_evt: GestureResponderEvent) => {
//                 if (disabled) return;
//                 hasCancelled.current = false;
//                 setIsPressed(true);
//                 panX.setValue(0);
//                 try {
//                     onPressIn();
//                 } catch (e) {
//                     console.warn("PTTButton onPressIn error:", e);
//                 }
//             },
//             onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
//                 if (disabled) return;
//                 const dx = Math.max(0, gestureState.dx); // only allow rightward movement
//                 // ignore if vertical movement dominates
//                 if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 6) {
//                     return;
//                 }

//                 // clamp to a small overshoot
//                 const max = threshold * 1.2;
//                 panX.setValue(Math.min(dx, max));

//                 if (!hasCancelled.current && dx >= threshold) {
//                     hasCancelled.current = true;
//                     // snap to threshold visually
//                     Animated.timing(panX, {
//                         toValue: threshold,
//                         duration: 120,
//                         useNativeDriver: true,
//                     }).start();

//                     // call cancel callback (do not await here)
//                     Promise.resolve()
//                         .then(() => onSwipeCancel())
//                         .catch((err) => {
//                             console.warn("PTTButton onSwipeCancel error:", err);
//                         });
//                 }
//             },
//             onPanResponderRelease: () => {
//                 if (disabled) {
//                     setIsPressed(false);
//                     return;
//                 }

//                 setIsPressed(false);

//                 if (hasCancelled.current) {
//                     // cancelled via swipe: reset and skip onPressOut
//                     hasCancelled.current = false;
//                     Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
//                     return;
//                 }

//                 // normal release -> call onPressOut
//                 Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
//                 try {
//                     onPressOut();
//                 } catch (e) {
//                     console.warn("PTTButton onPressOut error:", e);
//                 }
//             },
//             onPanResponderTerminate: () => {
//                 // treat termination as release
//                 setIsPressed(false);
//                 if (!hasCancelled.current) {
//                     Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
//                     try {
//                         onPressOut();
//                     } catch (e) {
//                         console.warn("PTTButton onPressOut (terminate) error:", e);
//                     }
//                 } else {
//                     hasCancelled.current = false;
//                     Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
//                 }
//             },
//         })
//     ).current;

//     // animated styles
//     const translateX = panX;
//     const hintOpacity = panX.interpolate({
//         inputRange: [0, 10, threshold * 0.6],
//         outputRange: [1, 0.92, 0.45],
//         extrapolate: "clamp",
//     });

//     const buttonScale = isPressed ? 0.985 : 1;

//     return (
//         <View style={styles.wrapper}>
//             <Animated.View
//                 style={[
//                     styles.hintContainer,
//                     {
//                         transform: [{ translateX }],
//                         opacity: hintOpacity,
//                     },
//                 ]}
//                 pointerEvents="none"
//             >
//                 <Text style={styles.hintText}>Slide right to cancel →</Text>
//             </Animated.View>

//             <Animated.View
//                 {...panResponder.panHandlers}
//                 style={[
//                     styles.btn,
//                     disabled && styles.disabled,
//                     { transform: [{ translateX }, { scale: buttonScale }] },
//                 ]}
//                 accessibilityLabel="Push to talk"
//                 accessibilityHint="Press to record. Slide to the right while holding to cancel."
//                 accessible={true}
//             >
//                 <Text style={styles.btnText}>{label}</Text>
//             </Animated.View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     wrapper: {
//         width: "100%",
//         alignItems: "center",
//         justifyContent: "center",
//         paddingHorizontal: 12,
//     },
//     btn: {
//         backgroundColor: "#0057FF",
//         paddingVertical: 14,
//         paddingHorizontal: 28,
//         borderRadius: 28,
//         alignItems: "center",
//         justifyContent: "center",
//         minWidth: 200,
//         elevation: 2,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.12,
//         shadowRadius: 2,
//     },
//     btnText: { color: "white", fontWeight: "700" },
//     disabled: {
//         opacity: 0.6,
//     },
//     hintContainer: {
//         position: "absolute",
//         top: -40, // placed above the button, centered
//         alignSelf: "center",
//         width: 260,
//         alignItems: "center",
//     },
//     hintText: {
//         color: "#333",
//         fontWeight: "600",
//         backgroundColor: "transparent",
//     },
// });

///

// // components/PTTButton.tsx
// import { Ionicons } from "@expo/vector-icons";
// import * as Haptics from "expo-haptics";
// import React, { useEffect, useRef, useState } from "react";
// import {
//     Animated,
//     GestureResponderEvent,
//     PanResponder,
//     PanResponderGestureState,
//     StyleSheet,
//     Text,
//     View
// } from "react-native";

// type Props = {
//     onPressIn: () => void;
//     onPressOut: () => void;
//     onSwipeCancel: () => Promise<void> | void;
//     disabled?: boolean;
//     label?: string; // default "Press to talk"
//     swipeCancelThreshold?: number; // px
//     externalPan?: Animated.Value; // optional: receives panX updates for overlay sync
// };

// const DEFAULT_THRESHOLD = 120;

// export default function PTTButton({
//     onPressIn,
//     onPressOut,
//     onSwipeCancel,
//     disabled = false,
//     label = "Press to talk",
//     swipeCancelThreshold = DEFAULT_THRESHOLD,
//     externalPan,
// }: Props) {
//     // pan drives horizontal translation when user drags right to cancel
//     const panX = useRef(new Animated.Value(0)).current;
//     // expose to parent overlay if provided
//     useEffect(() => {
//         if (!externalPan) return;
//         const id = panX.addListener(({ value }) => {
//             try {
//                 externalPan.setValue(value);
//             } catch { }
//         });
//         return () => panX.removeListener(id);
//     }, [panX, externalPan]);

//     const hasCancelled = useRef(false);
//     const [isRecording, setIsRecording] = useState(false); // becomes true after press in
//     const [isPressed, setIsPressed] = useState(false);

//     // subtle arrow animation loop while recording visible
//     const arrowAnim = useRef(new Animated.Value(0)).current;
//     useEffect(() => {
//         let loop: Animated.CompositeAnimation | null = null;
//         if (isRecording) {
//             loop = Animated.loop(
//                 Animated.sequence([
//                     Animated.timing(arrowAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
//                     Animated.timing(arrowAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
//                 ])
//             );
//             loop.start();
//         } else {
//             arrowAnim.stopAnimation();
//             arrowAnim.setValue(0);
//         }
//         return () => {
//             if (loop) loop.stop();
//         };
//     }, [isRecording, arrowAnim]);

//     const threshold = Math.max(48, swipeCancelThreshold);

//     // Press animation (scale)
//     const pressScale = useRef(new Animated.Value(1)).current;
//     useEffect(() => {
//         Animated.timing(pressScale, {
//             toValue: isPressed ? 1.06 : 1,
//             duration: 140,
//             useNativeDriver: true,
//         }).start();
//     }, [isPressed, pressScale]);

//     // Pan responder
//     const panResponder = useRef(
//         PanResponder.create({
//             onStartShouldSetPanResponder: () => !disabled,
//             onMoveShouldSetPanResponder: (_evt, gs) => {
//                 const horizontalDominant = Math.abs(gs.dx) > Math.abs(gs.dy);
//                 return !disabled && horizontalDominant && Math.abs(gs.dx) > 6;
//             },
//             onPanResponderGrant: async (_evt: GestureResponderEvent) => {
//                 if (disabled) return;
//                 hasCancelled.current = false;
//                 setIsPressed(true);
//                 // small haptic to signal recording start
//                 try {
//                     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                 } catch { }
//                 // call app logic to start recording
//                 try {
//                     onPressIn();
//                     setIsRecording(true); // show swipe hint only after press begins
//                 } catch (e) {
//                     console.warn("PTTButton onPressIn error", e);
//                 }
//             },
//             onPanResponderMove: (_evt, gs: PanResponderGestureState) => {
//                 if (disabled) return;
//                 const dx = Math.max(0, gs.dx);
//                 // ignore if vertical dominates
//                 if (Math.abs(gs.dy) > Math.abs(gs.dx) && Math.abs(gs.dy) > 6) return;

//                 const max = threshold * 1.2;
//                 panX.setValue(Math.min(dx, max));

//                 if (!hasCancelled.current && dx >= threshold) {
//                     hasCancelled.current = true;
//                     // snap and call cancel
//                     Animated.timing(panX, { toValue: threshold, duration: 120, useNativeDriver: true }).start();
//                     try {
//                         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//                     } catch { }
//                     Promise.resolve(onSwipeCancel()).catch((err) => console.warn("onSwipeCancel error", err));
//                     // reflect cancel state
//                     setIsRecording(false);
//                 }
//             },
//             onPanResponderRelease: () => {
//                 setIsPressed(false);
//                 // if cancel happened via swipe, just reset and don't call onPressOut
//                 if (hasCancelled.current) {
//                     hasCancelled.current = false;
//                     Animated.timing(panX, { toValue: 0, duration: 160, useNativeDriver: true }).start();
//                     return;
//                 }
//                 // normal release -> stop recording
//                 Animated.timing(panX, { toValue: 0, duration: 160, useNativeDriver: true }).start();
//                 try {
//                     onPressOut();
//                 } catch (e) {
//                     console.warn("PTTButton onPressOut error", e);
//                 } finally {
//                     setIsRecording(false);
//                 }
//             },
//             onPanResponderTerminate: () => {
//                 setIsPressed(false);
//                 if (!hasCancelled.current) {
//                     Animated.timing(panX, { toValue: 0, duration: 160, useNativeDriver: true }).start();
//                     try {
//                         onPressOut();
//                     } catch (e) {
//                         console.warn("PTTButton onPressOut (terminate) error", e);
//                     } finally {
//                         setIsRecording(false);
//                     }
//                 } else {
//                     hasCancelled.current = false;
//                     Animated.timing(panX, { toValue: 0, duration: 160, useNativeDriver: true }).start();
//                 }
//             },
//         })
//     ).current;

//     // hint visibility anim: fade + slide in when recording
//     const hintOpacity = panX.interpolate({
//         inputRange: [0, threshold * 0.2, threshold * 0.6],
//         outputRange: [0, 0.6, 1],
//         extrapolate: "clamp",
//     });
//     const hintTranslate = panX.interpolate({
//         inputRange: [0, threshold],
//         outputRange: [8, 0],
//         extrapolate: "clamp",
//     });

//     // arrow translate for direction cue
//     const arrowTranslate = arrowAnim.interpolate({
//         inputRange: [0, 1],
//         outputRange: [0, 8],
//     });

//     // label visibility: hide while recording
//     const labelOpacity = isRecording ? 0 : 1;

//     return (
//         <View style={styles.wrapper}>
//             {/* SWIPE HINT (visible only when recording) */}
//             <Animated.View
//                 pointerEvents="none"
//                 style={[
//                     styles.hintWrap,
//                     { opacity: hintOpacity, transform: [{ translateY: hintTranslate }] },
//                 ]}
//                 accessible={false}
//             >
//                 <Animated.View style={[styles.hintInner, { transform: [{ translateX: arrowTranslate }] }]}>
//                     <Animated.Text style={styles.hintText}>Slide right to cancel</Animated.Text>
//                     <Animated.View style={styles.hintArrow}>
//                         <Ionicons name="chevron-forward" size={18} color="#444" />
//                     </Animated.View>
//                 </Animated.View>
//             </Animated.View>

//             {/* MIC BUTTON */}
//             <Animated.View
//                 {...panResponder.panHandlers}
//                 style={[
//                     styles.micWrap,
//                     disabled && styles.disabled,
//                     {
//                         transform: [{ translateX: panX }, { scale: pressScale }],
//                         // make mic scale slightly more while pressed for pop feel (scale driven by isPressed effect)
//                     },
//                 ]}
//                 accessibilityLabel="Press to talk"
//                 accessibilityHint="Press to record. Slide right to cancel while holding."
//                 accessible={true}
//             >
//                 <View style={styles.micCircle}>
//                     <Ionicons name="mic" size={28} color="#fff" />
//                 </View>
//             </Animated.View>

//             {/* Instruction label below */}
//             <Animated.View style={[styles.labelWrap, { opacity: labelOpacity }]}>
//                 <Text style={styles.labelText}>{label}</Text>
//             </Animated.View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     wrapper: {
//         width: "100%",
//         alignItems: "center",
//         justifyContent: "center",
//         paddingHorizontal: 12,
//     },

//     // mic + pill shape (we show just circular mic)
//     micWrap: {
//         // keep clickable area comfortable
//         borderRadius: 999,
//     },
//     micCircle: {
//         width: 82,
//         height: 82,
//         borderRadius: 42,
//         backgroundColor: "#0B5FFF",
//         alignItems: "center",
//         justifyContent: "center",
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 6 },
//         shadowOpacity: 0.18,
//         shadowRadius: 12,
//         elevation: 6,
//     },

//     // disabled visual
//     disabled: {
//         opacity: 0.6,
//     },

//     // instruction label
//     labelWrap: {
//         marginTop: 8,
//         fontStyle: "italic",
//         alignSelf: "flex-end",
//     },
//     labelText: {
//         fontSize: 14,
//         color: "#444",
//         fontWeight: "500",
//         fontStyle: "italic",
//     },

//     // swipe hint styles
//     hintWrap: {
//         position: "absolute",
//         top: -56,
//         alignSelf: "center",
//         width: 260,
//         alignItems: "center",
//         justifyContent: "center",
//     },
//     hintInner: {
//         flexDirection: "row",
//         alignItems: "center",
//         backgroundColor: "#fff",
//         paddingVertical: 8,
//         paddingHorizontal: 12,
//         borderRadius: 999,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.06,
//         shadowRadius: 6,
//         elevation: 3,
//     },
//     hintText: {
//         color: "#333",
//         fontWeight: "700",
//         marginRight: 8,
//     },
//     hintArrow: {
//         width: 28,
//         height: 28,
//         borderRadius: 14,
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: "#f0f0f0",
//     },
// });


/// okay
// components/PTTButton.tsx
// import { Ionicons } from "@expo/vector-icons";
// import React, { useEffect, useRef } from "react";
// import {
//     Animated,
//     GestureResponderEvent,
//     PanResponder,
//     PanResponderGestureState,
//     StyleSheet,
//     Text,
//     View,
// } from "react-native";

// type Props = {
//     onPressIn: () => void;
//     onPressOut: () => void;
//     onSwipeCancel: () => Promise<void> | void;
//     disabled?: boolean;
//     label?: string;
//     swipeCancelThreshold?: number;
//     /**
//      * Optional: an Animated.Value provided by the parent.
//      * If provided, PTTButton will use this value for panX so
//      * external components (e.g. CaptureOverlay) can animate in sync.
//      */
//     panX?: Animated.Value;
// };

// const DEFAULT_THRESHOLD = 120;

// export default function PTTButton({
//     onPressIn,
//     onPressOut,
//     onSwipeCancel,
//     disabled = false,
//     label = "Press to talk",
//     swipeCancelThreshold = DEFAULT_THRESHOLD,
//     panX: externalPanX,
// }: Props) {
//     // use external panX if provided, otherwise create internal
//     const internalPanX = useRef(new Animated.Value(0)).current;
//     const panX = externalPanX ?? internalPanX;

//     const hasCancelled = useRef(false);
//     const scaleAnim = useRef(new Animated.Value(1)).current;

//     useEffect(() => {
//         if (disabled) {
//             panX.setValue(0);
//             hasCancelled.current = false;
//             scaleAnim.setValue(1);
//         }
//         return () => {
//             panX.setValue(0);
//             hasCancelled.current = false;
//             scaleAnim.setValue(1);
//         };
//     }, [disabled, panX, scaleAnim]);

//     const threshold = Math.max(48, swipeCancelThreshold);

//     const animateScaleTo = (toValue: number, duration = 140) => {
//         Animated.timing(scaleAnim, {
//             toValue,
//             duration,
//             useNativeDriver: true,
//         }).start();
//     };

//     const panResponder = useRef(
//         PanResponder.create({
//             onStartShouldSetPanResponder: () => !disabled,
//             onMoveShouldSetPanResponder: (_evt, gestureState) => {
//                 const horizontalDominant = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
//                 return !disabled && horizontalDominant && Math.abs(gestureState.dx) > 6;
//             },
//             onPanResponderGrant: (_evt: GestureResponderEvent) => {
//                 if (disabled) return;
//                 hasCancelled.current = false;
//                 // animate scale up (press)
//                 animateScaleTo(1.12, 120);
//                 try {
//                     onPressIn();
//                 } catch (e) {
//                     console.warn("PTTButton onPressIn error:", e);
//                 }
//             },
//             onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
//                 if (disabled) return;
//                 // ignore vertical-dominant moves
//                 if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 6) {
//                     return;
//                 }

//                 const dx = Math.max(0, gestureState.dx);
//                 const max = threshold * 1.2;
//                 panX.setValue(Math.min(dx, max));

//                 if (!hasCancelled.current && dx >= threshold) {
//                     hasCancelled.current = true;
//                     // snap to threshold visually
//                     Animated.timing(panX, {
//                         toValue: threshold,
//                         duration: 120,
//                         useNativeDriver: true,
//                     }).start();

//                     // call cancel callback, don't await to avoid blocking
//                     Promise.resolve()
//                         .then(() => onSwipeCancel())
//                         .catch((err) => console.warn("onSwipeCancel error:", err));
//                     // give a subtle scale down to indicate cancel acknowledged
//                     animateScaleTo(0.98, 120);
//                 }
//             },
//             onPanResponderRelease: () => {
//                 if (disabled) return;
//                 // release scale back to neutral
//                 animateScaleTo(1, 160);

//                 if (hasCancelled.current) {
//                     // already cancelled via swipe: reset visual pan and skip onPressOut
//                     hasCancelled.current = false;
//                     Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
//                     return;
//                 }

//                 // normal release -> reset pan and call onPressOut
//                 Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
//                 try {
//                     onPressOut();
//                 } catch (e) {
//                     console.warn("PTTButton onPressOut error:", e);
//                 }
//             },
//             onPanResponderTerminate: () => {
//                 // treat termination like release
//                 animateScaleTo(1, 120);
//                 if (!hasCancelled.current) {
//                     Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
//                     try {
//                         onPressOut();
//                     } catch (e) {
//                         console.warn("PTTButton onPressOut (terminate) error:", e);
//                     }
//                 } else {
//                     hasCancelled.current = false;
//                     Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
//                 }
//             },
//         })
//     ).current;

//     // animated styles
//     const translateX = panX;
//     const hintOpacity = panX.interpolate({
//         inputRange: [0, 10, threshold * 0.6],
//         outputRange: [1, 0.92, 0.45],
//         extrapolate: "clamp",
//     });

//     // modern circular container + mic icon styling
//     const circleScale = scaleAnim;
//     const circleShadowStyle = {
//         transform: [{ scale: circleScale }],
//     };

//     return (
//         <View style={styles.wrapper}>
//             hint above button (moves with panX for synced feel)
//             <Animated.View pointerEvents="none" style={[styles.hintContainer, { transform: [{ translateX }] }]}>
//                 <Animated.Text style={[styles.hintText, { opacity: hintOpacity }]}>Slide right to cancel →</Animated.Text>
//             </Animated.View>

//             {/* the circular mic button */}
//             <Animated.View
//                 {...panResponder.panHandlers}
//                 accessibilityLabel="Press to talk"
//                 accessibilityHint="Press to record. Slide right while holding to cancel."
//                 accessible={true}
//                 style={[styles.touchArea]}
//             >
//                 <Animated.View style={[styles.circleOuter, circleShadowStyle]}>
//                     <Animated.View style={[styles.circleInner, { transform: [{ scale: circleScale }] }]}>
//                         <Ionicons name="mic" size={28} color="#fff" />
//                     </Animated.View>
//                 </Animated.View>

//                 {/* label below the button */}
//                 <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
//             </Animated.View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     wrapper: {
//         width: "100%",
//         alignItems: "center",
//         justifyContent: "center",
//         paddingHorizontal: 12,
//     },

//     // the touch container holds the circular mic and the label
//     touchArea: {
//         alignItems: "center",
//         justifyContent: "center",
//     },

//     // outer circle provides depth / border so the mic "pops out"
//     circleOuter: {
//         width: 88,
//         height: 88,
//         borderRadius: 88 / 2,
//         backgroundColor: "#fff",
//         alignItems: "center",
//         justifyContent: "center",
//         // soft shadow / glow
//         shadowColor: "#0b57ff",
//         shadowOffset: { width: 0, height: 6 },
//         shadowOpacity: 0.08,
//         shadowRadius: 12,
//         elevation: 4,
//     },

//     // inner circle actual mic color
//     circleInner: {
//         width: 68,
//         height: 68,
//         borderRadius: 68 / 2,
//         backgroundColor: "#0057FF",
//         alignItems: "center",
//         justifyContent: "center",
//     },

//     label: {
//         marginTop: 10,
//         fontSize: 14,
//         fontWeight: "700",
//         color: "#0f172a",
//     },

//     labelDisabled: {
//         opacity: 0.5,
//     },

//     hintContainer: {
//         position: "absolute",
//         top: -46,
//         alignSelf: "center",
//         width: 260,
//         alignItems: "center",
//     },
//     hintText: {
//         color: "#333",
//         fontWeight: "600",
//     },
//     // instruction label
//     labelWrap: {
//         marginTop: 8,
//         fontStyle: "italic",
//         alignSelf: "flex-end",
//     },
//     labelText: {
//         fontSize: 14,
//         color: "#444",
//         fontWeight: "500",
//         fontStyle: "italic",
//     },
// });

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    GestureResponderEvent,
    PanResponder,
    PanResponderGestureState,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Props = {
    onPressIn: () => void;
    onPressOut: () => void;
    onSwipeCancel: () => Promise<void> | void;
    disabled?: boolean;
    label?: string;
    swipeCancelThreshold?: number;
    panX?: Animated.Value;
};

const DEFAULT_THRESHOLD = 120;

export default function PTTButton({
    onPressIn,
    onPressOut,
    onSwipeCancel,
    disabled = false,
    label = "Press to talk",
    swipeCancelThreshold = DEFAULT_THRESHOLD,
    panX: externalPanX,
}: Props) {
    // use external panX if provided, otherwise create internal
    const internalPanX = useRef(new Animated.Value(0)).current;
    const panX = externalPanX ?? internalPanX;

    const hasCancelled = useRef(false);

    useEffect(() => {
        if (disabled) {
            panX.setValue(0);
            hasCancelled.current = false;
        }
        return () => {
            panX.setValue(0);
            hasCancelled.current = false;
        };
    }, [disabled, panX]);

    const threshold = Math.max(48, swipeCancelThreshold);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disabled,
            onMoveShouldSetPanResponder: (_evt, gestureState) => {
                const horizontalDominant = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
                return !disabled && horizontalDominant && Math.abs(gestureState.dx) > 6;
            },
            onPanResponderGrant: (_evt: GestureResponderEvent) => {
                if (disabled) return;
                hasCancelled.current = false;
                try {
                    onPressIn();
                } catch (e) {
                    console.warn("PTTButton onPressIn error:", e);
                }
            },
            onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                if (disabled) return;
                // ignore vertical-dominant moves
                if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 6) {
                    return;
                }

                const dx = Math.max(0, gestureState.dx);
                const max = threshold * 1.2;
                panX.setValue(Math.min(dx, max));

                if (!hasCancelled.current && dx >= threshold) {
                    hasCancelled.current = true;
                    // snap to threshold visually
                    Animated.timing(panX, {
                        toValue: threshold,
                        duration: 120,
                        useNativeDriver: true,
                    }).start();

                    // call cancel callback, don't await to avoid blocking
                    Promise.resolve()
                        .then(() => onSwipeCancel())
                        .catch((err) => console.warn("onSwipeCancel error:", err));
                }
            },
            onPanResponderRelease: () => {
                if (disabled) return;

                if (hasCancelled.current) {
                    // already cancelled via swipe: reset visual pan and skip onPressOut
                    hasCancelled.current = false;
                    Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
                    return;
                }

                // normal release -> reset pan and call onPressOut
                Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
                try {
                    onPressOut();
                } catch (e) {
                    console.warn("PTTButton onPressOut error:", e);
                }
            },
            onPanResponderTerminate: () => {
                // treat termination like release
                if (!hasCancelled.current) {
                    Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
                    try {
                        onPressOut();
                    } catch (e) {
                        console.warn("PTTButton onPressOut (terminate) error:", e);
                    }
                } else {
                    hasCancelled.current = false;
                    Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
                }
            },
        })
    ).current;

    // animated styles
    const translateX = panX;
    const hintOpacity = panX.interpolate({
        inputRange: [0, 10, threshold * 0.6],
        outputRange: [1, 0.92, 0.45],
        extrapolate: "clamp",
    });

    return (
        <View style={styles.wrapper}>
            {/* hint above button (moves with panX for synced feel)
            <Animated.View pointerEvents="none" style={[styles.hintContainer, { transform: [{ translateX }] }]}>
                <Animated.Text style={[styles.hintText, { opacity: hintOpacity }]}>Slide right to cancel →</Animated.Text>
            </Animated.View> */}

            {/* the circular mic button */}
            <Animated.View
                {...panResponder.panHandlers}
                accessibilityLabel="Press to talk"
                accessibilityHint="Press to record. Slide right while holding to cancel."
                accessible={true}
                style={[styles.touchArea]}
            >
                <View style={styles.circleOuter}>
                    <View style={styles.circleInner}>
                        <Ionicons name="mic" size={28} color="#fff" />
                    </View>
                </View>


                <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        // paddingHorizontal: 12,
    },

    // the touch container holds the circular mic and the label
    touchArea: {
        alignItems: "center",
        justifyContent: "center",
    },

    // outer circle provides depth / border so the mic "pops out"
    circleOuter: {
        width: 72,
        height: 72,
        borderRadius: 72 / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        // soft shadow / glow
        shadowColor: "#0b57ff",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },

    // inner circle actual mic color
    circleInner: {
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
        backgroundColor: "#0057FF",
        alignItems: "center",
        justifyContent: "center",
    },

    label: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: "600",
        color: "#0f172a",
        textAlign: "center",
        fontStyle: "italic",
    },

    labelDisabled: {
        opacity: 0.5,
    },

    hintContainer: {
        position: "absolute",
        top: -46,
        alignSelf: "center",
        width: 260,
        alignItems: "center",
    },
    hintText: {
        color: "#333",
        fontWeight: "600",
    },
    // instruction label
    labelWrap: {
        marginTop: 8,
        fontStyle: "italic",
        alignSelf: "flex-end",
    },
    labelText: {
        fontSize: 14,
        color: "#444",
        fontWeight: "500",
        fontStyle: "italic",
    },
});
