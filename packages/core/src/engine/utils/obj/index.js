import Mesh from "./mesh";
import { Material, MaterialLibrary } from "./material";
import { Layout, TYPES, DuplicateAttributeException, Attribute } from "./layout";
import { downloadModels, downloadModelsFromZip, downloadMeshes, initMeshBuffers, deleteMeshBuffers, } from "./utils";
const version = "2.0.3";
export const OBJ = {
    Attribute,
    DuplicateAttributeException,
    Layout,
    Material,
    MaterialLibrary,
    Mesh,
    TYPES,
    downloadModels,
    downloadModelsFromZip,
    downloadMeshes,
    initMeshBuffers,
    deleteMeshBuffers,
    version,
};
/**
 * @namespace
 */
export { Attribute, DuplicateAttributeException, Layout, Material, MaterialLibrary, Mesh, TYPES, downloadModels, downloadModelsFromZip, downloadMeshes, initMeshBuffers, deleteMeshBuffers, version, };
