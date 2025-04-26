import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom"; // Import Link
import ModuleElement from "../components/ModuleElement";
import axiosInstance from "../api/axiosInstance";

const ModuleList = () => {
  const [currentClass, setCurrentClass] = useState(null);
  const [modulesOfClass, setModulesOfClass] = useState([]);
  const [loading, setLoading] = useState(true);
  const { classId } = useParams();

  const fetchData = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      console.log(classId);
      const classResponse = await axiosInstance.get(
        `/api/classes/getClass/${classId}`
      );
      setCurrentClass(classResponse.data);
      const response = await axiosInstance.get(
        `/api/classes/${classId}/modules`
      );
      // Assuming the backend route /api/classes/:id returns an array of modules directly
      setModulesOfClass(response.data);
    } catch (error) {
      console.error("Error fetching modules:", error);
      setCurrentClass(null);
      setModulesOfClass([]);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchData();
    // fetchModules will re-run if classId changes
  }, [classId, fetchData]);

  const handleAddModule = async () => {
    const newModuleName = prompt("Enter new module name:");
    if (newModuleName && classId) {
      try {
        const response = await axiosInstance.post("/api/modules", {
          name: newModuleName,
          classId: classId,
          description: "Default description",
        });
        setModulesOfClass([...modulesOfClass, response.data]);
      } catch (error) {
        console.error("Error adding module:", error);
        alert("Failed to add module.");
      }
    }
  };

  if (loading) return <div>Loading modules...</div>;

  return (
    <div className="container">
      <h1 className="nav1-header">{`${currentClass.name} `}</h1>
      {modulesOfClass.length === 0 && !loading ? (
        <p>No modules found for this class.</p>
      ) : (
        <ul className="module-list-in-class module-list">
          {modulesOfClass.map((module) => (
            <li key={module._id}>
              <ModuleElement data={module} />
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleAddModule}>Add Module</button>
    </div>
  );
};

export default ModuleList;
