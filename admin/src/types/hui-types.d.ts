export {};

declare global {
	/**
   * Now declare things that go in the global namespace,
   * or augment existing declarations in the global namespace.
   */
	interface RoutesType {
		name: string;
		layout: string;
		component:  JSX.Element;
		icon: JSX.Element | string;
		path: string;
		secondary?: boolean;
	}

	// Database Models
	interface User {
		id: number;
		name: string;
		email: string;
		password: string;
		role: string;
		created_at: Date;
		updated_at: Date;
		birthdate: Date;
		phone?: string;
		image?: string;
	}

	interface Park {
		id: number;
		name: string;
		location: string;
		created_at: Date;
		updated_at: Date;
		image?: string;
	}

	interface Bike {
		id: number;
		model: string;
		status: string;
		lock: boolean;
		location: string;
		price: number;
		park_id: number;
		image?: string;
		rating?: number;
		review_count?: number;
		dealer_name?: string;
		dealer_contact?: string;
		seats?: number;
		fuel_type?: string;
		transmission?: string;
		created_at: Date;
		updated_at: Date;
	}

	interface Rental {
		id: number;
		user_id: number;
		bike_id: number;
		start_time: Date;
		end_time?: Date;
		status: string;
		price: number;
		created_at: Date;
		updated_at: Date;
		qrcode?: string;
		payment_id?: string;
		order_id?: string;
	}

	interface BookingRequest {
		id: number;
		user_id?: number;
		name: string;
		contact_method: string;
		contact_details: string;
		pickup_location: string;
		status: string;
		admin_notes?: string;
		created_at: Date;
		updated_at: Date;
	}
}
