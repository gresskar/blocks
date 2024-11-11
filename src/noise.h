#pragma once

#include "containers.h"

void noise_init();
void noise_generate(
    group_t* group,
    const int x,
    const int z);
void noise_ssao_rotation(float* data, const int size);
void noise_ssao_kernel(float* data, const int size);