/// <reference types="nativewind/types" />

import "nativewind/types";

declare module "react-native" {
    interface ViewProps {
        className?: string;
    }
    interface TextProps {
        className?: string;
    }
    interface ImageProps {
        className?: string;
    }
    interface PressableProps {
        className?: string;
    }
    interface ScrollViewProps {
        className?: string;
    }
}
