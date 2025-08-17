/*!
 ____  _____ _____ _    ____ _____ ____    _    
|  _ \| ____|  ___/ \  / ___|_   _|  _ \  / \   
| |_) |  _| | |_ / _ \| |     | | | |_) |/ _ \  
|  _ <| |___|  _/ ___ \ |___  | | |  _ </ ___ \ 
|_| \_\_____|_|/_/   \_\____| |_| |_| \_\_/   \_\
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Refactra Dashboard - v1.0.0
=========================================================

* Product Page: https://www.refactra.com/
* Copyright 2025 Refactra Team (https://www.refactra.com/)

* Designed and Coded by Refactra Team

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import { Box } from '@chakra-ui/react';
import ProjectsTable from 'views/admin/projects/components/ProjectsTable';
import React from 'react';

export default function Projects() {
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <ProjectsTable />
    </Box>
  );
}
