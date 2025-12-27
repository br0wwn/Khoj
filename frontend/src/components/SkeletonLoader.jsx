import React from 'react';

// Base skeleton component with shimmer animation
export const Skeleton = ({ className = '', variant = 'rect', ...props }) => {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';

    const variantClasses = {
        rect: 'rounded',
        circle: 'rounded-full',
        text: 'rounded h-4',
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant] || variantClasses.rect} ${className}`}
            {...props}
        />
    );
};

// Alert Card Skeleton
export const AlertCardSkeleton = ({ variant = 'grid' }) => {
    if (variant === 'list') {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <Skeleton className="h-20 w-20 rounded" />
                    <Skeleton className="h-20 w-20 rounded" />
                    <Skeleton className="h-20 w-20 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                </div>
            </div>
        </div>
    );
};

// Conversation Card Skeleton
export const ConversationSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-start space-x-4">
            <Skeleton variant="circle" className="w-14 h-14 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    </div>
);

// Profile Info Skeleton
export const ProfileInfoSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center mb-6">
            <Skeleton variant="circle" className="w-32 h-32 mb-4" />
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64 mb-4" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
            </div>
        </div>
        <div className="space-y-4">
            <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-full" />
            </div>
            <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-48" />
            </div>
            <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-32" />
            </div>
        </div>
    </div>
);

// Notification Item Skeleton
export const NotificationSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
            <Skeleton variant="circle" className="w-10 h-10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    </div>
);

// Group Card Skeleton
export const GroupCardSkeleton = () => (
    <div className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
        <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
        </div>
    </div>
);

// Report Card Skeleton
export const ReportCardSkeleton = ({ variant = 'grid' }) => {
    if (variant === 'list') {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-3" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <Skeleton className="w-20 h-20 rounded" />
                    <Skeleton className="w-20 h-20 rounded" />
                    <Skeleton className="w-20 h-20 rounded" />
                </div>
            </div>
        );
    }

    // Grid variant
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center gap-3 text-sm">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
        </div>
    );
};

// Alert Details Skeleton
export const AlertDetailsSkeleton = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 px-6 py-4">
            <Skeleton className="h-8 w-64 mb-2 bg-white/30" />
            <Skeleton className="h-4 w-96 bg-white/20" />
        </div>
        <div className="p-6 space-y-6">
            <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-64 rounded-lg" />
                <Skeleton className="h-64 rounded-lg" />
            </div>
            <div>
                <Skeleton className="h-6 w-40 mb-3" />
                <Skeleton className="h-80 rounded-lg" />
            </div>
        </div>
    </div>
);

export default Skeleton;
