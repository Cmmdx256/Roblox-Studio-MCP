--!strict
-- Standardized Error Codes matching prompt specification

local Errors = {
	PLUGIN_NOT_INITIALIZED = "PLUGIN_NOT_INITIALIZED",
	MCP_NOT_CONNECTED = "MCP_NOT_CONNECTED",
	INVALID_REQUEST = "INVALID_REQUEST",
	INVALID_ARGUMENT = "INVALID_ARGUMENT",
	INSTANCE_NOT_FOUND = "INSTANCE_NOT_FOUND",
	INSTANCE_AMBIGUOUS = "INSTANCE_AMBIGUOUS",
	PROPERTY_NOT_FOUND = "PROPERTY_NOT_FOUND",
	PROPERTY_NOT_WRITABLE = "PROPERTY_NOT_WRITABLE",
	SCRIPT_NOT_EDITABLE = "SCRIPT_NOT_EDITABLE",
	SCRIPT_PATCH_FAILED = "SCRIPT_PATCH_FAILED",
	UNSUPPORTED_API = "UNSUPPORTED_API",
	SECURITY_RESTRICTION = "SECURITY_RESTRICTION",
	ROBLOX_API_ERROR = "ROBLOX_API_ERROR",
	HTTP_PERMISSION_ERROR = "HTTP_PERMISSION_ERROR",
	TRANSPORT_ERROR = "TRANSPORT_ERROR",
	TIMEOUT = "TIMEOUT",
	INTERNAL_ERROR = "INTERNAL_ERROR",
}

export type ErrorObject = {
	code: string,
	message: string,
	details: { [string]: any }?,
	target: string?,
}

function Errors.Create(code: string, message: string, details: { [string]: any }?, target: string?): ErrorObject
	return {
		code = code,
		message = message,
		details = details or {},
		target = target,
	}
end

return Errors
