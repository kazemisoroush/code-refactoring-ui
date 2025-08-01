import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Badge,
  Button,
  HStack,
  Alert,
  AlertIcon,
  Spinner,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ButtonGroup,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { MdDelete, MdEdit } from 'react-icons/md';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import Card from 'components/card/Card';
import { projectService } from '../../../../services/projectService';

const columnHelper = createColumnHelper();

export default function ProjectsTable() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextToken, setNextToken] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const [sorting, setSorting] = React.useState([]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTags = (tags) => {
    if (!tags || Object.keys(tags).length === 0) {
      return (
        <Text fontSize="sm" color="gray.500">
          No tags
        </Text>
      );
    }

    return (
      <HStack spacing={1} flexWrap="wrap">
        {Object.entries(tags).map(([key, value]) => (
          <Badge key={key} colorScheme="blue" fontSize="xs">
            {key}: {value}
          </Badge>
        ))}
      </HStack>
    );
  };

  const handleDelete = async (projectId) => {
    setDeleteConfirm(projectId);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setLoading(true);
    const result = await projectService.deleteProject(deleteConfirm);

    if (result.success) {
      // Reload projects after successful deletion
      loadProjects();
    } else {
      setError(`Failed to delete project: ${result.error}`);
    }

    setDeleteConfirm(null);
    onClose();
    setLoading(false);
  };

  const columns = [
    columnHelper.accessor('project_id', {
      id: 'project_id',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          PROJECT ID
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('name', {
      id: 'name',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          NAME
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('created_at', {
      id: 'created_at',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          CREATED
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {formatDate(info.getValue())}
        </Text>
      ),
    }),
    columnHelper.accessor('tags', {
      id: 'tags',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          TAGS
        </Text>
      ),
      cell: (info) => formatTags(info.getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          ACTIONS
        </Text>
      ),
      cell: (info) => (
        <HStack spacing={2}>
          <IconButton
            aria-label="Edit project"
            icon={<MdEdit />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
          />
          <IconButton
            aria-label="Delete project"
            icon={<MdDelete />}
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={() => handleDelete(info.row.original.project_id)}
          />
        </HStack>
      ),
    }),
  ];

  const table = useReactTable({
    data: projects,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const loadProjects = async (token = null) => {
    setLoading(true);
    setError(null);

    const params = {};
    if (token) {
      params.next_token = token;
    }

    const result = await projectService.getProjects(params);

    if (result.success) {
      setProjects(result.data.projects || []);
      setNextToken(result.data.next_token);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleNextPage = () => {
    if (nextToken) {
      setCurrentPage((prev) => prev + 1);
      loadProjects(nextToken);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      loadProjects(); // Load first page, could be improved with token history
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading && projects.length === 0) {
    return (
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" justify="space-between" mb="20px" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            Projects
          </Text>
        </Flex>
        <Box px="25px" py="50px" textAlign="center">
          <Spinner size="xl" />
          <Text mt={4} color="gray.500">
            Loading projects...
          </Text>
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" justify="space-between" mb="20px" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            Projects
          </Text>
        </Flex>
        <Box px="25px">
          <Alert status="error" mb="4">
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="bold">Unable to load projects</Text>
              <Text fontSize="sm">{error}</Text>
            </Box>
          </Alert>
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={() => {
              setError(null);
              loadProjects();
            }}
            size="sm"
          >
            Retry
          </Button>
        </Box>
      </Card>
    );
  }

  return (
    <>
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" justify="space-between" mb="20px" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            Projects
          </Text>
          <Button colorScheme="brand" size="sm">
            Add Project
          </Button>
        </Flex>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <Th
                        key={header.id}
                        colSpan={header.colSpan}
                        pe="10px"
                        borderColor={borderColor}
                        cursor="pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <Flex
                          justifyContent="space-between"
                          align="center"
                          fontSize={{ sm: '10px', lg: '12px' }}
                          color="gray.400"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: '',
                            desc: '',
                          }[header.column.getIsSorted()] ?? null}
                        </Flex>
                      </Th>
                    );
                  })}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={columns.length} textAlign="center" py="50px">
                    <Spinner />
                  </Td>
                </Tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <Tr>
                  <Td colSpan={columns.length} textAlign="center" py="50px">
                    <Text color="gray.500">No projects found</Text>
                  </Td>
                </Tr>
              ) : (
                table.getRowModel().rows.map((row) => {
                  return (
                    <Tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <Td
                            key={cell.id}
                            fontSize={{ sm: '14px' }}
                            minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                            borderColor="transparent"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </Td>
                        );
                      })}
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        <Flex px="25px" justify="space-between" align="center" mb="20px">
          <Text fontSize="sm" color="gray.500">
            Page {currentPage}{' '}
            {projects.length > 0 && `(${projects.length} items)`}
          </Text>
          <ButtonGroup variant="ghost" size="sm">
            <IconButton
              icon={<LuChevronLeft />}
              onClick={handlePrevPage}
              isDisabled={currentPage === 1 || loading}
              aria-label="Previous page"
            />

            <IconButton
              variant={currentPage === 1 ? 'solid' : 'ghost'}
              onClick={() => {
                if (currentPage !== 1) {
                  setCurrentPage(1);
                  loadProjects();
                }
              }}
              isDisabled={loading}
            >
              1
            </IconButton>

            {currentPage > 1 && (
              <IconButton variant="solid" isDisabled={true}>
                {currentPage}
              </IconButton>
            )}

            <IconButton
              icon={<LuChevronRight />}
              onClick={handleNextPage}
              isDisabled={!nextToken || loading}
              aria-label="Next page"
            />
          </ButtonGroup>
        </Flex>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this project? This action cannot be
            undone.
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
