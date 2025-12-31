import { useState, useEffect } from "react";
import useAuth from "utils/auth/AuthHook";
import Switch from "components/switch";

type EditDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  data: { module: string; id: string } | null;
};

const DrawerEdit: React.FC<EditDrawerProps> = ({ isOpen, onClose, data }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<any>(null);
  const [parks, setParks] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      fetch(
        `${process.env.REACT_APP_API_URL}${data.module}s${
          data.module === "user" ? "" : "/" + data.module
        }/${data.id || 1}`,
        {
          credentials: "include",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          setFormData(data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });

      // If editing a bike and park_id exists in the model, fetch available parks
      const fetchParks = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}parks`, {
            credentials: "include",
          });
          const list = await response.json();
          let filtered = Array.isArray(list) ? list : [];
          if (user && user.role === "dealer") {
            filtered = filtered.filter((p: any) => p.dealer_id === user.id);
          }
          setParks(filtered);
        } catch (err) {
          console.error("Error fetching parks:", err);
          setParks([]);
        }
      };

      fetchParks();
    }
  }, [data, user]);

  const handleSave = () => {
    if (formData) {
      const forbiddenFields = ["id", "created_at", "updated_at", "dealer_id", "Bike"];
      const filteredData = Object.keys(formData)
        .filter((key) => !forbiddenFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = formData[key];
          return obj;
        }, {} as any);

      const url = `${process.env.REACT_APP_API_URL}${data.module}s/${data.module}/${data.id}`;
      const method = "PUT";

      fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Data updated successfully:", data);
          onClose();
        })
        .catch((error) => {
          console.error("Error updating data:", error);
        });
    }
  };

  const handleChange = (event: any) => {
    let value: any;
    if (event && event.target) {
      if (event.target.type === "checkbox") {
        value = event.target.checked;
      } else if (event.target.name.endsWith("id")) {
        value = Number(event.target.value);
      } else {
        value = event.target.value;
      }
      setFormData({
        ...formData,
        [event.target.name]: value,
      });
    } else if (typeof event === "object") {
      // fallback for switch components that might call onChange with value
      // e.g., setFormData({ ...formData, lock: event });
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transform overflow-hidden transition-transform duration-500 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>
        <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
          <div className="w-screen max-w-md">
            <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
              <div className="h-0 flex-1 overflow-y-auto">
                <header className="space-y-1 bg-blue-700 px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between space-x-3">
                    <h2 className="text-lg font-medium text-white">
                      Edit {data ? data.module : ""}
                    </h2>
                    <div className="flex h-7 items-center">
                      <button
                        onClick={onClose}
                        className="rounded-md bg-blue-700 text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                      >
                        <span className="sr-only">Close panel</span>
                      </button>
                    </div>
                  </div>
                </header>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="px-4 sm:px-6">
                    {formData ? (
                      (() => {
                        const forbiddenFields = ["id", "created_at", "updated_at", "dealer_id", "Bike"];
                        const visibleKeys = Object.keys(formData).filter((key) => {
                          // Exclude forbidden keys and nested objects/arrays (relations)
                          if (forbiddenFields.includes(key)) return false;
                          const value = formData[key];
                          if (value && typeof value === 'object') return false;
                          return true;
                        });

                        if (visibleKeys.length === 0) {
                          return <p>No editable fields available</p>;
                        }

                        return visibleKeys.map((key) => (
                          <div key={key} className="relative mt-6 flex-1">
                            <label
                              htmlFor={key}
                              className="block text-sm font-medium text-gray-900"
                            >
                              {key}
                            </label>
                            <div className="mt-1">
                              {key === "lock" ? (
                                <Switch
                                  name={key}
                                  checked={Boolean(formData[key])}
                                  onChange={handleChange}
                                  color="blue"
                                />
                              ) : key === "park_id" ? (
                                <select
                                  name={key}
                                  value={formData[key] || ""}
                                  onChange={handleChange}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                  <option value="">Select a park</option>
                                  {parks.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} {p.location ? ` - ${p.location}` : ""}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={key.endsWith("id") ? "number" : "text"}
                                  name={key}
                                  id={key}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                  value={formData[key] || ""}
                                  onChange={handleChange}
                                />
                              )}
                            </div>
                          </div>
                        ));
                      })()
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 px-4 pb-4 sm:px-6">
                    <button
                      onClick={handleSave}
                      type="button"
                      className="border-transparent inline-flex w-full justify-center rounded-md border bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DrawerEdit;
