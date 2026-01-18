import { useState, useEffect } from "react";
import useAuth from "utils/auth/AuthHook";
import Switch from "components/switch";
import ReactDOM from "react-dom";
import axios from "axios";
const ModalCreate: React.FC<{ module: string; children: React.ReactNode }> = ({
  module,
  children,
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [fields, setFields] = useState([]);
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});
  const [parks, setParks] = useState<any[]>([]);

  // Error popup state
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorBody, setErrorBody] = useState<string | null>(null);

  // prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [isOpen]);


  useEffect(() => {
    const getFields = async (module: string): Promise<string[]> => {
      // console.log("getFields",module)
      try {
        // console.log(`${process.env.REACT_APP_API_URL}${module}s${module === "user" ? "" : "/" + module
        //   }/2`)
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}${module}s${module === "user" ? "" : "/" + module
          }/check`,
          {
            withCredentials: true,
          }
        );
        // console.log("response ", response)
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }

        const result: any = response.data;

        // If API returns an array sample or empty, fall back to sensible defaults for each module
        let sample: any = result;
        if (Array.isArray(result) && result.length > 0) sample = result[0];

        const defaultFieldsMap: { [key: string]: string[] } = {
          park: ["name", "location", "image"],
          bike: ["model", "seats", "status", "lock", "location", "price", "park_id", "image"],
          // expose birthdate and password on create form for users
          user: ["name", "email", "password", "role", "phone", "birthdate", "image"],
          rental: ["user_id", "bike_id", "start_time", "end_time", "status", "price"],
        };

        let fields =
          sample && typeof sample === "object" && Object.keys(sample).length > 0
            ? Object.keys(sample)
            : defaultFieldsMap[module] || [];

        // Exclude internal/relation fields by default (always exclude dealer_id and internal bike fields from the create form)
        const excludedFields = ["created_at", "updated_at", "id", "Bike", "bike", "dealer_id", "rating", "review_count", "dealer_name", "dealer_contact"];
        fields = fields.filter((field) => !excludedFields.includes(field));

        // console.log("fields", fields);
        if (module === "rental") {
          return [
            "user_id",
            "bike_id",
            "start_time",
            "end_time",
            "status",
            "price",
            "qrcode",
            "payment_id",
            "order_id",
          ];
        }
        // console.log("fields", fields);
        return fields;
      } catch (error) {
        console.error(error);
        return [];
      }
    };

    const fetchFields = async () => {
      const fields = await getFields(module);
      setFields(fields);
    };

    fetchFields();
  }, [module, user]);

  // Fetch parks when park_id is needed
  useEffect(() => {
    const fetchParks = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}parks`, {
          credentials: "include",
        });
        const result = await response.json();
        let list = Array.isArray(result) ? result : [];
        // If backend doesn't filter by dealer, filter client-side
        if (user && user.role === "dealer") {
          list = list.filter((p: any) => p.dealer_id === user.id);
        }
        setParks(list);
      } catch (err) {
        console.error("Failed to fetch parks:", err);
        setParks([]);
      }
    };

    if (fields.includes("park_id")) {
      fetchParks();
    }
  }, [fields, user]);

  const handleChange = (event: any) => {
    let value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    if (event.target.name.endsWith("id")) {
      value = Number(value);
    } else if (event.target.name.endsWith("time")) {
      value = new Date(value).toISOString().slice(0, 16);
    } else if (event.target.name === "birthdate") {
      value = new Date(value).toISOString().slice(0, 10);
    } else if (event.target.name === "price") {
      value = parseFloat(value);
    }
    setFormValues({
      ...formValues,
      [event.target.name]: value,
    });
  };

  const handleSubmit = async () => {
    // Convert date-time strings into Date instances
    const data = Object.fromEntries(
      Object.entries(formValues).map(([key, value]) => {
        if (key.endsWith("time") || key === "birthdate") {
          // console.log(value);
          value = new Date(value).toISOString();
          // console.log(value);
        }
        return [key, value];
      })
    );

    const createItem = async (module: string, data: { [key: string]: any }) => {
      // console.log("birthdate", data);
      // console.log("birthdate", module);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}${module}s/${module}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      // console.log("-response------------");
      // console.log(response);
      // console.log("-------------");
      let result: any = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }
      if (!response.ok) {
        console.error("Create failed:", response.status, result);
        // Throw structured error so caller can render detailed messages
        throw { status: response.status, result };
      }
      // console.log("-resulte------------");
      // console.log(result);
      // console.log("-------------");
      return result;
    };
    try {
      // Loại bỏ các trường không hợp lệ trước khi gửi lên server (always exclude dealer_id)
      const forbiddenFields = ["id", "created_at", "updated_at", "Bike", "bike", "dealer_id", "rating", "review_count", "dealer_name", "dealer_contact"];

      const filteredData = Object.keys(data)
        .filter((key) => !forbiddenFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = (data as any)[key];
          return obj;
        }, {} as any);

      // Module-specific sanitization and validation
      let payloadToSend: any = filteredData;
      if (module === 'user') {
        // Whitelist only fields the backend expects for user creation to avoid 400 errors
        const allowedUserFields = ['name', 'email', 'password', 'role', 'phone', 'birthdate'];
        payloadToSend = Object.keys(filteredData).filter(k => allowedUserFields.includes(k)).reduce((obj, k) => {
          obj[k] = (filteredData as any)[k];
          return obj;
        }, {} as any);

        // Password validation
        if (payloadToSend.password && (typeof payloadToSend.password !== 'string' || payloadToSend.password.length < 8)) {
          setErrorTitle('Create failed (validation)');
          setErrorBody('Password must be a string and at least 8 characters long.');
          setErrorOpen(true);
          return;
        }

        // Birthdate validation -> ensure valid date
        if (payloadToSend.birthdate) {
          const d = new Date(payloadToSend.birthdate);
          if (Number.isNaN(d.getTime())) {
            setErrorTitle('Create failed (validation)');
            setErrorBody('Birthdate must be a valid date.');
            setErrorOpen(true);
            return;
          }
          // Send ISO string for consistency
          payloadToSend.birthdate = d.toISOString();
        }
      }

      // Client-side validation to avoid sending invalid park payloads
      if (module === "park") {
        if (!payloadToSend.name || !payloadToSend.location) {
          setErrorTitle('Create failed (validation)');
          setErrorBody('Both name and location are required to create a park.');
          setErrorOpen(true);
          return;
        }
      }

      await createItem(module, payloadToSend);
      setIsOpen(false);
    } catch (err: any) {
      console.error("Error creating item:", err);

      // Build user-friendly error message
      let title = 'Create failed';
      let body = 'An unexpected error occurred.';

      if (err && typeof err === 'object') {
        if (err.status) title = `Create failed (status ${err.status})`;
        const payload = err.result || err;
        if (payload && typeof payload === 'object') {
          if (Array.isArray(payload.message)) {
            body = payload.message.join('\n');
          } else if (payload.message) {
            body = String(payload.message);
          } else if (payload.error) {
            body = String(payload.error);
          } else {
            try {
              body = JSON.stringify(payload, null, 2);
            } catch (e) {
              body = String(payload);
            }
          }
        } else if (typeof payload === 'string') {
          body = payload;
        }
      } else if (typeof err === 'string') {
        body = err;
      }

      setErrorTitle(title);
      setErrorBody(body);
      setErrorOpen(true);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[9999] overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-black bg-opacity-80 transition-opacity"
                aria-hidden="true"
                onClick={() => setIsOpen(false)}
              ></div>

              <span
                className="hidden sm:inline-block sm:h-screen sm:align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <div className="relative z-[10000] inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <h3
                    className="text-lg font-medium leading-6 text-gray-900"
                    id="modal-title"
                  >
                    Create a new {module}
                  </h3>
                  <div className="mt-2">
                    {fields.map((field) => (
                      <div key={field} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {field}
                        </label>
                        {field.endsWith("time") ? (
                          <input
                            type="datetime-local"
                            name={field}
                            value={formValues[field]}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-b-2 pl-1 shadow-md outline-none focus:border-indigo-300"
                          />
                        ) : field === "lock" ? (
                          <Switch
                            name={field}
                            checked={formValues[field]}
                            onChange={handleChange}
                            color="blue"
                          />
                        ) : field === "price" ? (
                          <input
                            type="number"
                            step="0.01"
                            name={field}
                            value={formValues[field]}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-b-2 pl-1 shadow-md outline-none focus:border-indigo-300"
                          />
                        ) : field === "role" ? (
                          <select
                            name={field}
                            value={formValues[field] || "user"}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-b-2 pl-1 shadow-md outline-none focus:border-indigo-300"
                          >
                            <option value="admin">admin</option>
                            <option value="dealer">dealer</option>
                            <option value="user">user</option>
                          </select>
                        ) : field === "seats" ? (
                          <input
                            type="number"
                            name={field}
                            value={formValues[field] || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-b-2 pl-1 shadow-md outline-none focus:border-indigo-300"
                          />
                        ) : field === "status" && module === "bike" ? (
                          <select
                            name={field}
                            value={formValues[field] || "available"}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-b-2 pl-1 shadow-md outline-none focus:border-indigo-300"
                          >
                            <option value="available">Available</option>
                            <option value="out_of_stock">Out of stock</option>
                            <option value="locked">Locked</option>
                          </select>
                        ) : field === "park_id" ? (
                          <select
                            name={field}
                            value={formValues[field] || ""}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-b-2 pl-1 shadow-md outline-none focus:border-indigo-300"
                          >
                            <option value="">Select a park</option>
                            {parks.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} {p.location ? ` - ${p.location}` : ""}
                              </option>
                            ))}
                          </select>
                        ) : field === "birthdate" ? (
                          <input
                            type="date"
                            name={field}
                            value={formValues[field] || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-b-2 pl-1 shadow-md outline-none focus:border-indigo-300"
                          />
                        ) : field === "image" ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              name={field}
                              onChange={async (e) => {
                                const file = e.target.files && e.target.files[0];
                                if (!file) return;
                                try {
                                  const fd = new FormData();
                                  fd.append('file', file);
                                  const res = await fetch(`${process.env.REACT_APP_API_URL}uploads/image`, {
                                    method: 'POST',
                                    body: fd,
                                    credentials: 'include',
                                  });
                                  const payload = await res.json();
                                  if (!res.ok) throw new Error(payload?.message || 'Upload failed');
                                  // store returned value (use name if you prefer to store filename)
                                  setFormValues({ ...formValues, [field]: payload.name || payload.url, image_preview: payload.url || (payload.name ? `${process.env.REACT_APP_API_URL}uploads/image/${encodeURIComponent(payload.name)}` : undefined) });
                                } catch (err) {
                                  console.error('Upload failed', err);
                                  alert('Image upload failed');
                                }
                              }}
                              className="mt-1"
                            />
                            {formValues.image_preview || (formValues.image && formValues.image.startsWith('http') ? formValues.image : null) ? (
                              <img src={formValues.image_preview || formValues.image} className="h-12 w-12 rounded object-cover" alt="preview" />
                            ) : null}
                          </div>
                        ) : (
                          <input
                            type={field === 'password' ? 'password' : (field.endsWith("id") ? "number" : "text")}
                            name={field}
                            value={formValues[field] || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-b-2 pl-1 shadow-md outline-none focus:border-indigo-300"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="border-transparent inline-flex w-full justify-center rounded-md border bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleSubmit}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {errorOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[10001] flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-70" onClick={() => setErrorOpen(false)}></div>
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <h4 className="mb-2 text-lg font-semibold">{errorTitle}</h4>
              <pre className="mb-4 max-h-64 overflow-auto whitespace-pre-wrap text-sm">{errorBody}</pre>
              <div className="text-right">
                <button
                  className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                  onClick={() => setErrorOpen(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ModalCreate;
