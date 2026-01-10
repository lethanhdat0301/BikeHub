import React, { useState, useEffect } from 'react';
import { MdClose, MdPerson, MdDirectionsBike, MdDateRange, MdAttachMoney } from 'react-icons/md';

interface ReferralHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    referrerId: number;
    referrerName: string;
}

interface ReferralDetail {
    id: number;
    bookingId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    bikeModel: string;
    bikeId: number;
    rentalPrice: number;
    estimatedCommission: number;
    startDate: string;
    endDate: string;
    status: string;
    createdAt: string;
}

interface ReferralHistory {
    referrer: any;
    totalReferrals: number;
    totalEarnings: number;
    estimatedCommission: number;
    referralHistory: ReferralDetail[];
}

const ReferralHistoryModal: React.FC<ReferralHistoryModalProps> = ({
    isOpen,
    onClose,
    referrerId,
    referrerName
}) => {
    const [loading, setLoading] = useState(false);
    const [historyData, setHistoryData] = useState<ReferralHistory | null>(null);

    useEffect(() => {
        if (isOpen && referrerId) {
            fetchReferralHistory();
        }
    }, [isOpen, referrerId]);

    const fetchReferralHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}referrers/${referrerId}/history`,
                { credentials: 'include' }
            );
            const data = await response.json();
            setHistoryData(data);
        } catch (error) {
            console.error('Error fetching referral history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white dark:bg-navy-800">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                    <div>
                        <h3 className="text-xl font-bold text-navy-700 dark:text-white">
                            Referral History: {referrerName}
                        </h3>
                        {historyData && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {historyData.totalReferrals} total referrals • {formatCurrency(historyData.totalEarnings)} total earnings
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-navy-700"
                    >
                        <MdClose className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[calc(90vh-100px)] overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <p className="text-lg text-gray-500">Loading referral history...</p>
                        </div>
                    ) : !historyData ? (
                        <div className="flex h-64 items-center justify-center">
                            <p className="text-lg text-gray-500">No data available</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="rounded-lg bg-blue-50 p-4 dark:bg-navy-700">
                                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Referrals</div>
                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {historyData.totalReferrals}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-green-50 p-4 dark:bg-navy-700">
                                    <div className="text-sm font-medium text-green-600 dark:text-green-400">Total Earnings</div>
                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                        {formatCurrency(historyData.totalEarnings)}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-purple-50 p-4 dark:bg-navy-700">
                                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Estimated Commission</div>
                                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                        {formatCurrency(historyData.estimatedCommission)}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-orange-50 p-4 dark:bg-navy-700">
                                    <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg. per Referral</div>
                                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                        {formatCurrency(historyData.totalEarnings / historyData.totalReferrals || 0)}
                                    </div>
                                </div>
                            </div>

                            {/* Referral History Table */}
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-navy-700">
                                <h4 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">
                                    Detailed Referral History
                                </h4>
                                {historyData.referralHistory.length === 0 ? (
                                    <p className="text-center text-gray-500">No referral history found</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Booking ID</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Customer</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Bike</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Rental Period</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Price</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Commission</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historyData.referralHistory.map((referral) => (
                                                    <tr key={referral.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-navy-800">
                                                        <td className="px-4 py-4">
                                                            <div className="font-medium text-navy-700 dark:text-white">
                                                                {referral.bookingId}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {formatDate(referral.createdAt)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <MdPerson className="h-4 w-4 text-gray-400" />
                                                                <div>
                                                                    <div className="font-medium text-navy-700 dark:text-white">
                                                                        {referral.customerName}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {referral.customerEmail || referral.customerPhone}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <MdDirectionsBike className="h-4 w-4 text-gray-400" />
                                                                <div>
                                                                    <div className="font-medium text-navy-700 dark:text-white">
                                                                        {referral.bikeModel}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        ID: {referral.bikeId}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <MdDateRange className="h-4 w-4 text-gray-400" />
                                                                <div>
                                                                    <div className="text-sm text-navy-700 dark:text-white">
                                                                        {formatDate(referral.startDate)}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        to {formatDate(referral.endDate)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <MdAttachMoney className="h-4 w-4 text-green-500" />
                                                                <div className="font-semibold text-green-600">
                                                                    {formatCurrency(referral.rentalPrice)}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="font-semibold text-purple-600">
                                                                {formatCurrency(referral.estimatedCommission)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                referral.status === 'completed' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : referral.status === 'active' || referral.status === 'ONGOING'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {referral.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReferralHistoryModal;