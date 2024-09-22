'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNextStep } from './NextStepContext';
import { motion, useInView } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import DefaultCard from './DefaultCard';
import DynamicPortal from './DynamicPortal';
const NextStep = ({ children, steps, shadowRgb = '0, 0, 0', shadowOpacity = '0.2', cardTransition = { ease: 'anticipate', duration: 0.6 }, cardComponent: CardComponent, onStepChange = () => { }, onComplete = () => { }, onSkip = () => { }, displayArrow = true, clickThroughOverlay = false, }) => {
    const { currentTour, currentStep, setCurrentStep, isNextStepVisible, closeNextStep } = useNextStep();
    const currentTourSteps = steps.find((tour) => tour.tour === currentTour)?.steps;
    const [elementToScroll, setElementToScroll] = useState(null);
    const [pointerPosition, setPointerPosition] = useState(null);
    const currentElementRef = useRef(null);
    const observeRef = useRef(null); // Ref for the observer element
    const isInView = useInView(observeRef);
    const offset = 20;
    const [documentHeight, setDocumentHeight] = useState(0);
    const [viewport, setViewport] = useState(window.document.body);
    const [viewportRect, setViewportRect] = useState(window.document.body.getBoundingClientRect());
    const [scrollableParent, setScrollableParent] = useState(window.document.body);
    // - -
    // Route Changes
    const router = useRouter();
    const pathname = usePathname();
    // - -
    // Initialize
    useEffect(() => {
        if (isNextStepVisible && currentTourSteps) {
            console.log('NextStep: Current Step Changed');
            const step = currentTourSteps[currentStep];
            // Default viewport is the body
            let tempViewport = window.document.body;
            if (step) {
                if (step.viewportID) {
                    const stepViewport = document.querySelector(`#${step.viewportID}`);
                    if (stepViewport) {
                        tempViewport = stepViewport;
                    }
                }
            }
            const tempViewportRect = tempViewport.getBoundingClientRect();
            setViewport(tempViewport);
            setViewportRect(tempViewportRect);
            setScrollableParent(getScrollableParent(tempViewport));
            if (step && step.selector) {
                const element = document.querySelector(step.selector);
                if (element) {
                    setPointerPosition(getElementPosition(element));
                    currentElementRef.current = element;
                    setElementToScroll(element);
                    const rect = element.getBoundingClientRect();
                    const isInViewportWithOffset = rect.top >= -offset && rect.bottom <= window.innerHeight + offset;
                    if (!isInView || !isInViewportWithOffset) {
                        const side = checkSideCutOff(currentTourSteps?.[currentStep]?.side || 'right');
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: side.includes('top')
                                ? 'end'
                                : side.includes('bottom')
                                    ? 'start'
                                    : 'center',
                        });
                    }
                }
            }
            else {
                // Reset pointer position to middle of the screen when selector is empty, undefined, or ""
                if (step.viewportID) {
                    setPointerPosition({
                        x: getScrollableParent(tempViewport).getBoundingClientRect().width / 2,
                        y: getScrollableParent(tempViewport).getBoundingClientRect().height / 2,
                        width: 0,
                        height: 0,
                    });
                }
                else {
                    setPointerPosition({
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                        width: 0,
                        height: 0,
                    });
                }
                currentElementRef.current = null;
                setElementToScroll(null);
            }
        }
    }, [currentStep, currentTourSteps, isInView, offset, isNextStepVisible]);
    // - -
    // Update viewport rect
    const updateViewportRect = () => {
        // Default viewport is the body
        let tempViewport = window.document.body;
        if (currentTourSteps && currentStep !== undefined) {
            const step = currentTourSteps[currentStep];
            if (step.viewportID) {
                // If the step has a viewportID, use the wrapper as the viewport
                const stepViewport = document.querySelector(`#${step.viewportID}`);
                if (stepViewport) {
                    tempViewport = stepViewport;
                }
            }
        }
        setViewport(tempViewport);
        setViewportRect(tempViewport.getBoundingClientRect());
        setScrollableParent(getScrollableParent(tempViewport));
    };
    // - -
    // Update viewport rect on window resize and path change
    useEffect(() => {
        if (isNextStepVisible) {
            // Call the updateViewportRect function initially when currentStep changes
            updateViewportRect();
            // Set up a resize event listener to update viewport rect on window resize
            window.addEventListener('resize', updateViewportRect);
            // Clean up the event listener on unmount
            return () => {
                window.removeEventListener('resize', updateViewportRect);
            };
        }
    }, [currentStep, pathname, currentTourSteps, isNextStepVisible]);
    // - -
    // Helper function to get element position
    const getElementPosition = (element) => {
        const elementRect = element.getBoundingClientRect();
        // Default viewport is the body
        let viewport = window.document.body;
        let viewPortRect = window.document.body.getBoundingClientRect();
        if (currentTourSteps && currentStep) {
            const step = currentTourSteps[currentStep];
            if (step.viewportID) {
                // If the step has a viewportID, use the wrapper as the viewport
                const tempViewport = document.querySelector(`#${step.viewportID}`);
                if (tempViewport) {
                    viewport = tempViewport;
                    viewPortRect = viewport.getBoundingClientRect();
                }
            }
        }
        // Calculate the position of the element relative to the viewport
        const relativeTop = elementRect.top - viewPortRect.top + viewport.scrollTop;
        const relativeLeft = elementRect.left - viewPortRect.left + viewport.scrollLeft;
        return {
            x: relativeLeft,
            y: relativeTop,
            width: elementRect.width,
            height: elementRect.height,
        };
    };
    // - -
    // Update pointerPosition when currentStep changes
    useEffect(() => {
        if (isNextStepVisible && currentTourSteps) {
            console.log('NextStep: Current Step Changed');
            const step = currentTourSteps[currentStep];
            // Default viewport is the body
            let tempViewport = window.document.body;
            if (step) {
                if (step.viewportID) {
                    // If the step has a viewportID, use the wrapper as the viewport
                    const viewport = document.querySelector(`#${step.viewportID}`);
                    if (viewport) {
                        tempViewport = viewport;
                    }
                }
            }
            const tempViewportRect = tempViewport.getBoundingClientRect();
            setViewport(tempViewport);
            setViewportRect(tempViewportRect);
            setScrollableParent(getScrollableParent(tempViewport));
            if (step && step.selector) {
                const element = document.querySelector(step.selector);
                if (element) {
                    setPointerPosition(getElementPosition(element));
                    currentElementRef.current = element;
                    setElementToScroll(element);
                    const rect = element.getBoundingClientRect();
                    const isInViewportWithOffset = rect.top >= -offset && rect.bottom <= window.innerHeight + offset;
                    if (!isInView || !isInViewportWithOffset) {
                        const side = checkSideCutOff(currentTourSteps?.[currentStep]?.side || 'right');
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: side.includes('top')
                                ? 'end'
                                : side.includes('bottom')
                                    ? 'start'
                                    : 'center',
                        });
                    }
                }
            }
            else {
                // Reset pointer position to middle of the screen when selector is empty, undefined, or ""
                if (step.viewportID) {
                    setPointerPosition({
                        x: getScrollableParent(tempViewport).getBoundingClientRect().width / 2,
                        y: getScrollableParent(tempViewport).getBoundingClientRect().height / 2,
                        width: 0,
                        height: 0,
                    });
                }
                else {
                    setPointerPosition({
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                        width: 0,
                        height: 0,
                    });
                }
                currentElementRef.current = null;
                setElementToScroll(null);
            }
        }
    }, [currentStep, currentTourSteps, isInView, offset, isNextStepVisible]);
    useEffect(() => {
        if (elementToScroll && !isInView && isNextStepVisible) {
            console.log('NextStep: Element to Scroll Changed');
            const side = checkSideCutOff(currentTourSteps?.[currentStep]?.side || 'right');
            elementToScroll.scrollIntoView({
                behavior: 'smooth',
                block: side.includes('top')
                    ? 'end'
                    : side.includes('bottom')
                        ? 'start'
                        : 'center',
                inline: 'center',
            });
        }
        else {
            // Scroll to the top of the body
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [elementToScroll, isInView, isNextStepVisible]);
    // - -
    // Update pointer position on window resize
    const updatePointerPosition = () => {
        if (currentTourSteps) {
            const step = currentTourSteps[currentStep];
            if (step && step.selector) {
                const element = document.querySelector(step.selector);
                if (element) {
                    setPointerPosition(getElementPosition(element));
                }
            }
            else {
                // Reset pointer position to middle of the screen when selector is empty, undefined, or ""
                const stepViewport = document.querySelector(`#${step.viewportID}`);
                if (step.viewportID && stepViewport) {
                    setPointerPosition({
                        x: getScrollableParent(stepViewport).getBoundingClientRect().width / 2,
                        y: scrollableParent.getBoundingClientRect().height / 2,
                        width: 0,
                        height: 0,
                    });
                }
                else {
                    setPointerPosition({
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                        width: 0,
                        height: 0,
                    });
                }
                currentElementRef.current = null;
                setElementToScroll(null);
            }
        }
    };
    // - -
    // Update pointer position on window resize
    useEffect(() => {
        if (isNextStepVisible) {
            window.addEventListener('resize', updatePointerPosition);
            return () => window.removeEventListener('resize', updatePointerPosition);
        }
    }, [currentStep, currentTourSteps, isNextStepVisible]);
    // - -
    // Update document height on window resize
    useEffect(() => {
        const updateDocumentHeight = () => {
            const height = Math.max(document.body.scrollHeight, 
            // document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight);
            setDocumentHeight(height);
        };
        updateDocumentHeight();
        window.addEventListener('resize', updateDocumentHeight);
        return () => window.removeEventListener('resize', updateDocumentHeight);
    }, []);
    // - -
    // Step Controls
    const nextStep = async () => {
        if (currentTourSteps && currentStep < currentTourSteps.length - 1) {
            try {
                const nextStepIndex = currentStep + 1;
                const route = currentTourSteps[currentStep].nextRoute;
                onStepChange?.(nextStepIndex);
                if (route) {
                    await router.push(route);
                    const targetSelector = currentTourSteps[nextStepIndex].selector;
                    if (targetSelector) {
                        // Use MutationObserver to detect when the target element is available in the DOM
                        const observer = new MutationObserver((mutations, observer) => {
                            const element = document.querySelector(targetSelector);
                            if (element) {
                                // Once the element is found, update the step and scroll to the element
                                setCurrentStep(nextStepIndex);
                                scrollToElement(nextStepIndex);
                                // Stop observing after the element is found
                                observer.disconnect();
                            }
                        });
                        // Start observing the document body for changes
                        observer.observe(document.body, {
                            childList: true,
                            subtree: true,
                        });
                    }
                    else {
                        setCurrentStep(nextStepIndex);
                    }
                }
                else {
                    setCurrentStep(nextStepIndex);
                    scrollToElement(nextStepIndex);
                }
            }
            catch (error) {
                console.error('Error navigating to next route', error);
            }
        }
        else if (currentTourSteps && currentStep === currentTourSteps.length - 1) {
            onComplete?.();
            closeNextStep();
        }
    };
    const prevStep = async () => {
        if (currentTourSteps && currentStep > 0) {
            try {
                const prevStepIndex = currentStep - 1;
                const route = currentTourSteps[currentStep].prevRoute;
                onStepChange?.(prevStepIndex);
                if (route) {
                    await router.push(route);
                    const targetSelector = currentTourSteps[prevStepIndex].selector;
                    if (targetSelector) {
                        // Use MutationObserver to detect when the target element is available in the DOM
                        const observer = new MutationObserver((mutations, observer) => {
                            const element = document.querySelector(targetSelector);
                            if (element) {
                                // Once the element is found, update the step and scroll to the element
                                setCurrentStep(prevStepIndex);
                                scrollToElement(prevStepIndex);
                                // Stop observing after the element is found
                                observer.disconnect();
                            }
                        });
                        // Start observing the document body for changes
                        observer.observe(document.body, {
                            childList: true,
                            subtree: true,
                        });
                    }
                    else {
                        setCurrentStep(prevStepIndex);
                    }
                }
                else {
                    setCurrentStep(prevStepIndex);
                    scrollToElement(prevStepIndex);
                }
            }
            catch (error) {
                console.error('Error navigating to previous route', error);
            }
        }
    };
    // - -
    // Skip Tour
    const skipTour = useCallback(() => {
        closeNextStep();
        onSkip?.();
    }, [closeNextStep, onSkip]);
    // - -
    // Keyboard Controls
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (isNextStepVisible && !currentTourSteps?.[currentStep]?.blockKeyboardControl) {
                switch (event.key) {
                    case 'ArrowRight':
                        nextStep();
                        break;
                    case 'ArrowLeft':
                        prevStep();
                        break;
                    case 'Escape':
                        skipTour();
                        break;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isNextStepVisible, nextStep, prevStep, skipTour]);
    // - -
    // Scroll to the correct element when the step changes
    const scrollToElement = (stepIndex) => {
        if (currentTourSteps) {
            const selector = currentTourSteps[stepIndex].selector;
            if (selector) {
                const element = document.querySelector(selector);
                if (element) {
                    const { top } = element.getBoundingClientRect();
                    const isInViewport = top >= -offset && top <= window.innerHeight + offset;
                    if (!isInViewport) {
                        const side = checkSideCutOff(currentTourSteps?.[stepIndex]?.side || 'right');
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: side.includes('top')
                                ? 'end'
                                : side.includes('bottom')
                                    ? 'start'
                                    : 'center',
                        });
                    }
                    // Update pointer position after scrolling
                    setPointerPosition(getElementPosition(element));
                }
            }
            else {
                // Reset pointer position to middle of the screen when selector is empty, undefined, or ""
                if (currentTourSteps?.[currentStep].viewportID) {
                    setPointerPosition({
                        x: scrollableParent.getBoundingClientRect().width / 2,
                        y: scrollableParent.getBoundingClientRect().height / 2,
                        width: 0,
                        height: 0,
                    });
                }
                else {
                    setPointerPosition({
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                        width: 0,
                        height: 0,
                    });
                }
                currentElementRef.current = null;
                setElementToScroll(null);
            }
        }
    };
    // - -
    // Check if Card is Cut Off on Sides
    const checkSideCutOff = (side) => {
        if (!side) {
            return side;
        }
        let tempSide = side;
        let removeSide = false;
        // Check if card would be cut off on sides
        if (side.startsWith('right') &&
            pointerPosition &&
            window.innerWidth < pointerPosition.x + pointerPosition.width + 256) {
            removeSide = true;
        }
        else if (side.startsWith('left') && pointerPosition && pointerPosition.x < 256) {
            removeSide = true;
        }
        // Check if card would be cut off on top or bottom
        if (side.includes('top') && pointerPosition && pointerPosition.y < 256) {
            if (removeSide) {
                tempSide = 'bottom';
            }
            else {
                tempSide = side.replace('top', 'bottom');
            }
        }
        else if (side.includes('bottom') &&
            pointerPosition &&
            pointerPosition.y + pointerPosition.height + 256 > window.innerHeight) {
            if (removeSide) {
                tempSide = 'top';
            }
            else {
                tempSide = side.replace('bottom', 'top');
            }
        }
        else if (removeSide) {
            tempSide = pointerPosition && pointerPosition.y < 256 ? 'bottom' : 'top';
        }
        return tempSide;
    };
    // - -
    // Card Side
    const getCardStyle = (side) => {
        if (!side || !currentTourSteps?.[currentStep].selector) {
            // Center the card if the selector is undefined or empty
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)', // Center the card
                position: 'fixed', // Make sure it's positioned relative to the viewport
                margin: '0',
            };
        }
        side = checkSideCutOff(side);
        switch (side) {
            case 'top':
                return {
                    transform: `translate(-50%, 0)`,
                    left: '50%',
                    bottom: '100%',
                    marginBottom: '25px',
                };
            case 'bottom':
                return {
                    transform: `translate(-50%, 0)`,
                    left: '50%',
                    top: '100%',
                    marginTop: '25px',
                };
            case 'left':
                return {
                    transform: `translate(0, -50%)`,
                    right: '100%',
                    top: '50%',
                    marginRight: '25px',
                };
            case 'right':
                return {
                    transform: `translate(0, -50%)`,
                    left: '100%',
                    top: '50%',
                    marginLeft: '25px',
                };
            case 'top-left':
                return {
                    bottom: '100%',
                    marginBottom: '25px',
                };
            case 'top-right':
                return {
                    right: 0,
                    bottom: '100%',
                    marginBottom: '25px',
                };
            case 'bottom-left':
                return {
                    top: '100%',
                    marginTop: '25px',
                };
            case 'bottom-right':
                return {
                    right: 0,
                    top: '100%',
                    marginTop: '25px',
                };
            case 'right-bottom':
                return {
                    left: '100%',
                    bottom: 0,
                    marginLeft: '25px',
                };
            case 'right-top':
                return {
                    left: '100%',
                    top: 0,
                    marginLeft: '25px',
                };
            case 'left-bottom':
                return {
                    right: '100%',
                    bottom: 0,
                    marginRight: '25px',
                };
            case 'left-top':
                return {
                    right: '100%',
                    top: 0,
                    marginRight: '25px',
                };
            default:
                return {}; // Default case if no side is specified
        }
    };
    // - -
    // Arrow position based on card side
    const getArrowStyle = (side) => {
        side = checkSideCutOff(side);
        switch (side) {
            case 'bottom':
                return {
                    transform: `translate(-50%, 0) rotate(270deg)`,
                    left: '50%',
                    top: '-23px',
                };
            case 'top':
                return {
                    transform: `translate(-50%, 0) rotate(90deg)`,
                    left: '50%',
                    bottom: '-23px',
                };
            case 'right':
                return {
                    transform: `translate(0, -50%) rotate(180deg)`,
                    top: '50%',
                    left: '-23px',
                };
            case 'left':
                return {
                    transform: `translate(0, -50%) rotate(0deg)`,
                    top: '50%',
                    right: '-23px',
                };
            case 'top-left':
                return {
                    transform: `rotate(90deg)`,
                    left: '10px',
                    bottom: '-23px',
                };
            case 'top-right':
                return {
                    transform: `rotate(90deg)`,
                    right: '10px',
                    bottom: '-23px',
                };
            case 'bottom-left':
                return {
                    transform: `rotate(270deg)`,
                    left: '10px',
                    top: '-23px',
                };
            case 'bottom-right':
                return {
                    transform: `rotate(270deg)`,
                    right: '10px',
                    top: '-23px',
                };
            case 'right-bottom':
                return {
                    transform: `rotate(180deg)`,
                    left: '-23px',
                    bottom: '10px',
                };
            case 'right-top':
                return {
                    transform: `rotate(180deg)`,
                    left: '-23px',
                    top: '10px',
                };
            case 'left-bottom':
                return {
                    transform: `rotate(0deg)`,
                    right: '-23px',
                    bottom: '10px',
                };
            case 'left-top':
                return {
                    transform: `rotate(0deg)`,
                    right: '-23px',
                    top: '10px',
                };
            default:
                return {
                    display: 'none',
                }; // Default case if no side is specified
        }
    };
    // - -
    // Card Arrow
    const CardArrow = ({ isVisible }) => {
        if (!isVisible) {
            return null;
        }
        return (_jsx("svg", { viewBox: "0 0 54 54", "data-name": "nextstep-arrow", className: "absolute w-6 h-6 origin-center", style: getArrowStyle(currentTourSteps?.[currentStep]?.side), children: _jsx("path", { id: "triangle", d: "M27 27L0 0V54L27 27Z", fill: "currentColor" }) }));
    };
    // - -
    // Overlay Variants
    const variants = {
        visible: { opacity: 1 },
        hidden: { opacity: 0 },
    };
    // - -
    // Pointer Options
    const pointerPadding = currentTourSteps?.[currentStep]?.pointerPadding ?? 30;
    const pointerPadOffset = pointerPadding / 2;
    const pointerRadius = currentTourSteps?.[currentStep]?.pointerRadius ?? 28;
    // Check if viewport is scrollable
    const isViewportScrollable = isElementScrollable(viewport);
    return (_jsxs("div", { "data-name": "nextstep-wrapper", className: "relative w-full", "data-nextstep": "dev", children: [_jsx("div", { "data-name": "nextstep-site", className: "block w-full", children: children }), pointerPosition && isNextStepVisible && (_jsx(DynamicPortal, { viewportID: currentTourSteps?.[currentStep]?.viewportID, children: _jsxs(motion.div, { "data-name": "nextstep-overlay", className: "absolute top-0 left-0 overflow-hidden h-full w-full", initial: "hidden", animate: isNextStepVisible ? 'visible' : 'hidden', variants: variants, transition: { duration: 0.5 }, style: {
                        height: isViewportScrollable ? `${viewport.scrollHeight}px` : '',
                        width: isViewportScrollable ? `${viewport.scrollWidth}px` : '',
                        zIndex: 997, // Ensure it's below the pointer but above other content
                        pointerEvents: 'none',
                    }, children: [!clickThroughOverlay && (_jsxs("div", { className: "absolute inset-0 z-[998] pointer-events-none", style: {
                                height: `${viewport.scrollHeight}px`,
                                width: `${viewport.scrollWidth}px`,
                            }, children: [_jsx("div", { className: "absolute top-0 left-0 right-0 pointer-events-auto", style: { height: Math.max(pointerPosition.y - pointerPadOffset, 0) } }), _jsx("div", { className: "absolute left-0 right-0 bottom-0 pointer-events-auto", style: {
                                        height: `${viewportRect.height -
                                            (pointerPosition.y + pointerPosition.height + pointerPadOffset)}px`,
                                    } }), _jsx("div", { className: "absolute left-0 top-0 pointer-events-auto", style: {
                                        width: Math.max(pointerPosition.x - pointerPadOffset, 0),
                                        height: viewportRect.height,
                                    } }), _jsx("div", { className: "absolute top-0 pointer-events-auto", style: {
                                        left: `${pointerPosition.x + pointerPosition.width + pointerPadOffset}px`,
                                        right: 0,
                                        height: viewportRect.height,
                                    } })] })), _jsx(motion.div, { "data-name": "nextstep-pointer", className: "relative z-[999]", style: {
                                boxShadow: `0 0 200vw 9999vh rgba(${shadowRgb}, ${shadowOpacity})`,
                                borderRadius: `${pointerRadius}px ${pointerRadius}px ${pointerRadius}px ${pointerRadius}px`,
                                pointerEvents: 'none',
                            }, initial: pointerPosition
                                ? {
                                    x: pointerPosition.x - pointerPadOffset,
                                    y: pointerPosition.y - pointerPadOffset,
                                    width: pointerPosition.width + pointerPadding,
                                    height: pointerPosition.height + pointerPadding,
                                }
                                : {}, animate: pointerPosition
                                ? {
                                    x: pointerPosition.x - pointerPadOffset,
                                    y: pointerPosition.y - pointerPadOffset,
                                    width: pointerPosition.width + pointerPadding,
                                    height: pointerPosition.height + pointerPadding,
                                }
                                : {}, transition: cardTransition, children: _jsx(motion.div, { className: "absolute flex flex-col max-w-[100%] min-w-min pointer-events-auto z-[999]", "data-name": "nextstep-card", style: getCardStyle(currentTourSteps?.[currentStep]?.side), transition: cardTransition, children: CardComponent ? (_jsx(CardComponent, { step: currentTourSteps?.[currentStep], currentStep: currentStep, totalSteps: currentTourSteps?.length ?? 0, nextStep: nextStep, prevStep: prevStep, arrow: _jsx(CardArrow, { isVisible: !!(currentTourSteps?.[currentStep]?.selector && displayArrow) }), skipTour: skipTour })) : (_jsx(DefaultCard, { step: currentTourSteps?.[currentStep], currentStep: currentStep, totalSteps: currentTourSteps?.length ?? 0, nextStep: nextStep, prevStep: prevStep, arrow: _jsx(CardArrow, { isVisible: !!(currentTourSteps?.[currentStep]?.selector && displayArrow) }), skipTour: skipTour })) }) })] }) })), pointerPosition &&
                isNextStepVisible &&
                currentTourSteps?.[currentStep]?.viewportID && (_jsx(DynamicPortal, { children: _jsx(motion.div, { "data-name": "nextstep-overlay2", className: "absolute top-0 left-0 overflow-hidden", initial: "hidden", animate: isNextStepVisible ? 'visible' : 'hidden', variants: variants, transition: { duration: 0.5 }, style: {
                        height: `${documentHeight}px`,
                        width: `${document.body.scrollWidth}px`,
                        zIndex: 997, // Ensure it's below the pointer but above other content
                        pointerEvents: 'none',
                    }, children: !clickThroughOverlay && (_jsxs("div", { className: "pointer-events-none absolute inset-0 z-[998]", style: { width: '100vw', height: documentHeight }, children: [_jsx("div", { className: "pointer-events-auto absolute left-0 right-0 top-0", style: {
                                    height: scrollableParent.getBoundingClientRect().top + window.scrollY,
                                    width: `${document.body.scrollWidth}px`,
                                    backgroundColor: `rgba(${shadowRgb}, ${shadowOpacity})`,
                                } }), _jsx("div", { className: "pointer-events-auto absolute left-0 right-0", style: {
                                    top: `${scrollableParent.getBoundingClientRect().bottom + window.scrollY}px`,
                                    height: `${documentHeight -
                                        scrollableParent.getBoundingClientRect().bottom -
                                        window.scrollY}px`,
                                    width: `${document.body.scrollWidth}px`,
                                    backgroundColor: `rgba(${shadowRgb}, ${shadowOpacity})`,
                                } }), _jsx("div", { className: "pointer-events-auto absolute", style: {
                                    left: '0',
                                    top: scrollableParent.getBoundingClientRect().top + window.scrollY,
                                    width: scrollableParent.getBoundingClientRect().left + window.scrollX,
                                    height: scrollableParent.getBoundingClientRect().height,
                                    backgroundColor: `rgba(${shadowRgb}, ${shadowOpacity})`,
                                } }), _jsx("div", { className: "pointer-events-auto absolute top-0", style: {
                                    top: scrollableParent.getBoundingClientRect().top + window.scrollY,
                                    left: `${scrollableParent.getBoundingClientRect().right + window.scrollX}px`,
                                    width: `${document.body.scrollWidth -
                                        scrollableParent.getBoundingClientRect().right -
                                        window.scrollX}px`,
                                    height: scrollableParent.getBoundingClientRect().height,
                                    backgroundColor: `rgba(${shadowRgb}, ${shadowOpacity})`,
                                } })] })) }) }))] }));
};
export default NextStep;
// Helper function to find the scrollable parent of an element
const getScrollableParent = (element) => {
    let parent = element.parentElement;
    while (parent) {
        const computedStyle = getComputedStyle(parent);
        const overflowY = computedStyle.overflowY;
        const overflowX = computedStyle.overflowX;
        const isScrollableY = overflowY === 'scroll' || overflowY === 'auto';
        const isScrollableX = overflowX === 'scroll' || overflowX === 'auto';
        if ((isScrollableY && parent.scrollHeight > parent.clientHeight) ||
            (isScrollableX && parent.scrollWidth > parent.clientWidth)) {
            return parent; // Found a scrollable parent
        }
        parent = parent.parentElement;
    }
    // No scrollable parent found, return the element itself
    return element;
};
// Check if element is scrollable
const isElementScrollable = (element) => {
    return (element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth ||
        element === document.body);
};
