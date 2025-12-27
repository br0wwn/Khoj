import React from 'react';

const SettingsModal = ({
    isOpen,
    onClose,
    emailNotifications,
    inAppNotifications,
    soundNotifications,
    onToggleEmail,
    onToggleInApp,
    onToggleSound,
    loading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />

                {/* Modal content */}
                <div
                    className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                                <p className="text-sm text-gray-500">Manage your notification preferences</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {/* Email Notifications */}
                        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                Receive alert updates via email
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-11 mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emailNotifications
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {emailNotifications ? '✓ Enabled' : '✗ Disabled'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={onToggleEmail}
                                    disabled={loading}
                                    className={`relative inline-flex h-8 w-16 flex-shrink-0 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${emailNotifications
                                        ? 'bg-blue-600 focus:ring-blue-500'
                                        : 'bg-gray-300 focus:ring-gray-400'
                                        }`}
                                    title={emailNotifications ? 'Disable email notifications' : 'Enable email notifications'}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${emailNotifications ? 'translate-x-9' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* In-App Notifications */}
                        <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">In-App Notifications</h3>
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                Show notifications in the website
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-11 mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inAppNotifications
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {inAppNotifications ? '✓ Enabled' : '✗ Disabled'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={onToggleInApp}
                                    disabled={loading}
                                    className={`relative inline-flex h-8 w-16 flex-shrink-0 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${inAppNotifications
                                        ? 'bg-purple-600 focus:ring-purple-500'
                                        : 'bg-gray-300 focus:ring-gray-400'
                                        }`}
                                    title={inAppNotifications ? 'Disable in-app notifications' : 'Enable in-app notifications'}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${inAppNotifications ? 'translate-x-9' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Sound Notifications */}
                        <div className="p-5 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Sound Notifications</h3>
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                Play sound when notifications arrive
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-11 mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${soundNotifications
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {soundNotifications ? '✓ Enabled' : '✗ Disabled'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={onToggleSound}
                                    disabled={loading}
                                    className={`relative inline-flex h-8 w-16 flex-shrink-0 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${soundNotifications
                                            ? 'bg-green-600 focus:ring-green-500'
                                            : 'bg-gray-300 focus:ring-gray-400'
                                        }`}
                                    title={soundNotifications ? 'Disable sound notifications' : 'Enable sound notifications'}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${soundNotifications ? 'translate-x-9' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-amber-900">
                                    <p className="font-semibold mb-1">About Notifications</p>
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li>Email notifications are sent to your registered email address</li>
                                        <li>In-app notifications appear on the website in real-time</li>
                                        <li>Sound alerts play when new notifications arrive</li>
                                        <li>You can customize each type independently</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
