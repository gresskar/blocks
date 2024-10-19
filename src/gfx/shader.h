#pragma once

void* shader_load(
    void* device,
    const char* file,
    const int samplers,
    const int uniforms);
void shader_unload(
    void* device,
    void* shader);